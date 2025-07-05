const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const users = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (username) => {
    users[username] = socket.id;
    console.log(`${username} joined with socket ID: ${socket.id}`);
  });

  socket.on('private_message', (msg) => {
    const toSocketId = users[msg.to];
    const fromSocketId = users[msg.from];

    // Alıcıya mesaj gönder
    if (toSocketId) {
      io.to(toSocketId).emit('private_message', msg);
    }

    // Gönderen kendi mesajını da görsün (aynı mesajı tekrar yolluyoruz)
    if (fromSocketId && fromSocketId !== toSocketId) {
      io.to(fromSocketId).emit('private_message', msg);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Kullanıcıyı users listesinden kaldırmak istersen buraya ekleyebilirsin
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
