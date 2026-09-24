const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title:{
    type: String,
    required: true,
  },
  description:{
    type: String,
    required: true,
  },
  date:{
    type: Date,
    required: true,
  },
  venue:{
    type:String,
    required: true,
  },
  totalSeats:{
    type:Number,
    required: true,
  },
  availableSeats:{
    type:Number,
    required:true,
  },
  price: {
  type: Number,
  required: true,
},
imageUrl: {
  type: String,
  default: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
},
  createdBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true,
  }
}, {timestamps: true});

module.exports = mongoose.model('Event', eventSchema);