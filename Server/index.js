import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server);

let users = [];

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

 
  socket.on('setUser', (name) => {
    users.push({ id: socket.id, name });
    io.emit('users', users.map(user => user.name)); 
  });

  
  socket.on('message', (data) => {
    io.emit('message', {
      user: data.user,
      message: data.message,
      from: socket.id
    });
  });

  // Desconectar un usuario explícitamente cuando se desconecta del chat
  socket.on('disconnectUser', (name) => {
    users = users.filter(user => user.id !== socket.id);
    io.emit('users', users.map(user => user.name)); 
    io.emit('userDisconnected', name); 
    console.log(`Usuario ${name} se desconectó.`);
  });

  // Manejar desconexión del socket
  socket.on('disconnect', () => {
    const user = users.find(user => user.id === socket.id);
    if (user) {
      io.emit('userDisconnected', user.name); 
      users = users.filter(u => u.id !== socket.id);
      io.emit('users', users.map(user => user.name)); 
      console.log('Usuario desconectado:', socket.id);
    }
  });
});

server.listen(4440, () => {
  console.log('Servidor corriendo en el puerto 4440');
});
