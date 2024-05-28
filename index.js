const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// Enable CORS for all routes and methods
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from this origin
  methods: ['GET', 'POST'], // Allowed HTTP methods
  credentials: true // Allow cookies to be sent
}));

// Setup Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true // Allow cookies to be sent
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('drawing', (data) => {
    io.emit('drawing', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('image', (imageData) => {
    socket.broadcast.emit('image', imageData);
  });

});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
