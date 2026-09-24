const express = require('express');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const {protect} = require('../middleware/authMiddleware');

const router = express.Router();

//create a razorpay order(step 1 of payment flow)
router.post('/create-order', protect, async(req,res) =>{
  try{

    const {eventId, seatsBooked} = req.body;
    console.log('Received body:', req.body);

    if(!seatsBooked || seatsBooked < 1){
      return res.status(400).json({message:'Seats booked must be at least 1'});
    }

    const event = await Event.findById(eventId);

    if(!event){
      return res.status(404).json({message: 'Event not found'});
    }

    if(event.availableSeats < seatsBooked){
      return res.status(400).json({message:'Enough seats are not available'});
    }

    const totalAmount = event.price * seatsBooked;

    const option ={
      amount: totalAmount * 100, //razorpay expects amount in paise. 
      currency: 'INR',
      receipt: `receipt_${eventId}_${Date.now()}`,

    }

    const order = await razorpay.orders.create(option);

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  }catch(error){
    res.status(500).json({message: 'server error', error: error.message});
  }
});

//Booked seats for an event (any logged-in user);
router.post('/verify-payment', protect, async(req,res)=>{
  const session = await mongoose.startSession();
  session.startTransaction();

  try{
    const {razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId, seatsBooked} = req.body;

    //step 1: verify the signature(prove this payment is genuine).
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');



    if(expectedSignature !== razorpay_signature){
      await session.abortTransaction();
      return res.status(400).json({message:'Payment verification failed'});
    }

    //Atomic Operation: // Atomic operation: find event with enough seats, and reduce seats in ONE step
    const event = await Event.findOneAndUpdate(
      {
        _id : eventId,
        availableSeats: { $gte: seatsBooked},
      },
      {
        $inc: { availableSeats: -seatsBooked}, //reduce seats automatically
      },
      {new: true, session}
      
    );
    // If no event was found/updated, it means not enough seats were available
    if(!event){
      await session.abortTransaction();
      return res.status(400).json({message:'Not enough seats available'});
    }

    // Create the booking record
    const booking = new Booking({
      event: eventId,
      user: req.user.id,
      seatsBooked,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });

    await booking.save({session});

    await session.commitTransaction();

     const io = req.app.get('io');
     io.emit('seatsUpdated',{
      eventId: event._id,
      availableSeats: event.availableSeats,
     });

    res.status(201).json({message:'Booking successfull', booking});
  }catch(error){
    await session.abortTransaction();
    res.status(500).json({message:'Server error', error:error.message});
  } finally{
    session.endSession();
  }
});

// Get my bookings (logged-in user only sees their own)
router.get('/my-bookings', protect, async(req,res)=>{
  try{
    const bookings = await Booking.find({user: req.user.id}).populate('event');
    res.status(200).json(bookings); 
  }catch(error){
    res.status(500).json({message:'Server error', error:error.message});
  }
});

module.exports = router;