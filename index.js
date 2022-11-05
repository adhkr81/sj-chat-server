const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


app.use(cors())

const users = [];

io.on("connection", socket => {

    const id = socket.id

    socket.on("join", (name, room) => {
        const user = { name, room, id };
        users.push(user);
        socket.join(user.room)
        socket.emit('message', { author: 'admin', content: `${user.name}, welcome to room ${user.room}.`})
        socket.broadcast.to(user.room).emit('message', { author: 'admin', content: `${user.name} has joined!` });
        
        usersArray = users.map((user) => user.name)
        io.to(user.room).emit('roomData', usersArray);
    })

    socket.on("message", (message) => {
        const user = users.find((user) => user.id === id);
        io.to(user.room).emit('message', { author: message.author, content: message.content });
    })
    
    socket.on("disconnect", () => {
        const user = users.find((user) => user.id === id);
        const index = users.findIndex((user) => user.id === id)

        if(user) {
            socket.broadcast.to(user.room).emit("message", { author: 'admin', content: `${user.name} has left.` });
          }

        if(index !== -1) {
            return users.splice(index, 1)[0]
        }
      })
})

server.listen(process.env.PORT || 4000, () => console.log(`Server has started at PORT 4000.`));