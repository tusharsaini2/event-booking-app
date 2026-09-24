const express = require('express');
const http = require('http');
const {Server} = require('socket.io')
const cors = require('cors');
const mongoose = require('mongoose');
const redisClient = require('./config/redis');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
require('dotenv').config();

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors:{
    origin:'*',
  },
});

app.set('io', io); // for export io object in other files, without messy imports

io.on('connection', (socket)=>{
  console.log('A user connected', socket.id);

  socket.on('disconnect', ()=>{
    console.log('User disconnected', socket.id);
  });
});

mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log('MongoDB successfully Connected!!!'))
.catch((err)=>console.log('error occured: ', err));

app.use(cors());
app.use(express.json());

app.get('/', (req,res) =>{
  res.send('Server is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, ()=>{
  console.log(`Server is running on port ${PORT}`);
});