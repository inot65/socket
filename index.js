const express = require('express');

const io = require('socket.io')(8900, {
  // cors: {
  //   origin: 'https://client-chat-tn8z.onrender.com',
  // },
  cors: {
    origin: '*',
  },
});

// fac aplicatia principala
const app = express();

// fac o matrice a utilizatorilor conectati
let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({userId, socketId});
};

// functie de sters un user deconectat
const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

// functie de regasit userul dupa userId
const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

app.listen(8800, () => {
  console.log('Backend server is running on 8800 port...');
  // conectare la baza de date
  conectareMongoDb();

  // lansare server socket

  io.on('connection', (socket) => {
    console.log('S-a conectat un utilizator.');
    // on connect
    // iau userId si SocketId de la utilizator
    // si il introduc in matrice, DOAR DACA nu exista deja
    socket.on('addUser', (userId) => {
      addUser(userId, socket.id);
      io.emit('getUsers', users);
    });

    // send and get message
    socket.on('sendMessage', ({senderId, receiverId, text}) => {
      const user = getUser(receiverId);
      // trimite la receiverId mesajul
      io.to(user.socketId).emit('getMessage', {
        senderId,
        text,
      });
    });

    // on disconnect
    socket.on('disconnect', () => {
      removeUser(socket.id);
      console.log('Un user s-a deconectat de la serverul socket!');
      // retrimit lista actualizata
      io.emit('getUsers', users);
    });
  });

  // raspund la get pentru a putea da click automat
  app.get('/', (req, res) => {
    res.send('Hey this is my API running 🥳 ');
  });
});
