const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  event:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required: true,
  },
  seatsBooked: {
    type: Number,
    required: true,
  },
    paymentId: {
    type: String,
  },
    orderId: {
    type: String,
  },
    status:{
    type: String,
    enum: ["confirmed", "cancelled"],
    default: "confirmed",
  },
}, {timestamps:true});

module.exports = mongoose.model('Booking', bookingSchema);