const io = require('socket.io-client');

// URL du serveur Socket.IO
const serverUrl = 'http://localhost:3333';

// Connexion au serveur Socket.IO
const socket = io(serverUrl);

// Événement de connexion réussie
socket.on('connect', () => {
  console.log('Connecté au serveur Socket.IO');
  socket.emit('newMessage', 'Hello, serveur!');
});

// server is emitting onMessage event
socket.on('onMessage', (message) => {
    console.log('Message du serveur:', message);
});

// Gérer la déconnexion du serveur
socket.on('disconnect', () => {
  console.log('Déconnecté du serveur Socket.IO');
});
