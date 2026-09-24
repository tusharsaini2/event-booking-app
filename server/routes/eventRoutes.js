const express = require('express');
const redisClient = require('../config/redis');
const {protect, adminOnly} = require('../middleware/authMiddleware');
const Event = require('../models/Event');
const upload = require('../middleware/upload');


const router = express.Router();

//create event(Admin only)
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  try{
    const { title, description, date, venue, totalSeats, price } = req.body;

const newEvent = new Event({
  title,
  description,
  date,
  venue,
  totalSeats,
  availableSeats: totalSeats,
  price,
  createdBy: req.user.id,
  imageUrl: req.file ? req.file.path : undefined,
});

    await newEvent.save();
    res.status(201).json(newEvent);
  }catch(error){
    res.status(500).json({message:'Server error', error: error.message})
  }
})

//Get all events anyone can view no login needed!
router.get('/', async(req,res)=>{
  try{
    const cacheKey = 'all_events';

    //Step 1: Check if we already have this data cached
    const cachedEvents = await redisClient.get(cacheKey);

    if(cachedEvents){
      console.log('Serving events from CACHE');
      return res.status(200).json(JSON.parse(cachedEvents));
    }

    //Step 2: Not cached, fetch from MongoDB
    console.log('Serving events from DATABASE');

    const events = await Event.find().populate('createdBy', 'name email');

    //Step 3: Save this result in redis for next time(expire in 60 seconds);
    await redisClient.setEx(cacheKey,60,JSON.stringify(events));

    res.status(200).json(events);
  }catch(error){
    res.status(500).json({message:'Server Error', error:error.message});
  }
});

//Get One event by ID(anyone can view)
router.get('/:id', async(req,res)=>{
  try{
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');

    if(!event){
      return res.status(404).json({message:'Event not found'});
    }
    res.status(200).json(event);
  }catch(error){
    res.status(500).json({message:'Server error', error:error.message});
  }
});

//update event
router.put('/:id',protect,adminOnly, async(req,res)=>{
  try{
    const event = await Event.findById(req.params.id);

    if(!event){
      return res.status(404).json({message:'Event not found'});
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id,req.body,{new:true});
    res.status(200).json({updatedEvent});
  }catch(error){
    res.status(500).json({message:'Server Error', error:error.message});
  }
});

//Delete Event (admin only)
router.delete('/:id',protect,adminOnly, async(req,res)=>{
  try{
    const event = await Event.findById(req.params.id);

    if(!event){
      return res.status(404).json({message:'Event not found'});
    }

    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({message:'Event Deleted Successfully!'});
  }catch(error){
    res.status(500).json({message:'Server error', error:error.message});
  }
});

module.exports = router;