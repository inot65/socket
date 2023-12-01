// const io = require('socket.io')(8900, {
//   cors: {
//     origin:
//       process.env.NODE_ENV === 'production'
//         ? 'https://client-chat-tn8z.onrender.com'
//         : 'http://localhost:3000/',
//   },
// });

const express = require('express');
const {createServer} = require('node:http');
const {join} = require('node:path');
const {Server} = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.send('<h1>Server Socket.IO pt aplicatia de chat <b>-demo-</b></h1>');
});

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

io.on('connection', (socket) => {
  console.log('S-a conectat un utilizator.');
  // on connection ->
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

// ascult pe portul
const port = 3000;

server.listen(port, () => {
  console.log('server running at port ', port);
});
