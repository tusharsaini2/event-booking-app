const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require("jsonwebtoken");
const transporter = require('../config/email');
const {protect} = require("../middleware/authMiddleware")

const router = express.Router();

router.post('/signup', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
    });

    await newUser.save({ session });

    // Try sending the email BEFORE committing the transaction
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your Event Booking App account',
      html: `
        <h2>Welcome, ${name}!</h2>
        <p>Your verification code is:</p>
        <h1>${otp}</h1>
        <p>This code will expire in 5 minutes.</p>
      `,
    });

    // Only commit (save permanently) if the email ALSO succeeded
    await session.commitTransaction();

    res.status(201).json({
      message: 'Signup successful! Please check your email for the OTP.',
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'server error', error: error.message });
  } finally {
    session.endSession();
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account already verified' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully! You can now log in.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//login user

router.post('/login', async(req,res)=>{
  try{
    const {email,password} = req.body;

    const user = await User.findOne({email});
   
    if(!user){
      return res.status(400).json({message:'Email & password not found'});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return res.status(400).json({message: 'Email & password not match'});
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    const token = jwt.sign(
      {id: user._id, role: user.role},
      process.env.JWT_SECRET,
      {expiresIn: '7d'}
    );

  res.status(200).json({
    message:'Login Successfull!',
    token,
    user:{
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })

}catch(error){
  res.status(500).json({message:'Server error', error: error.message});
}
})

// protected test route
router.get('/profile',protect, async(req,res)=>{
  try{
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  }catch(error){
    res.status(500).json({message:'server error', error:error.message});
  }
});

module.exports = router;