const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom, getChatRooms } = require('./utils/users')

const app = express();
const server = http.createServer(app); //created raw server
const io = socketio(server);    //passed it to the socketio

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))




io.on('connection', (socket) => {
    console.log('New WebSocket connection established.')

    socket.on('main-page', () => {
        socket.emit('chatRooms', getChatRooms())
    })

    socket.on('join', (options, callback) => {

        // const { error, user } = addUser({ id:socket.id, ...options })
        const { error, user } = addUser({ id:socket.id, ...options })

        if(error) {
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage('Admin', "Welcome!"))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined the room!`))
        io.to(user.room).emit('roomData', ({
            room: user.room,
            users: getUsersInRoom(user.room)
        }))
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        var filter = new Filter();
        if(filter.isProfane(message)){
            return callback('No profanity allowed')
        }
    
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, message))
        socket.emit('sender', 'right')
        callback()
    })

    socket.on('sendLocation', ({lat, long}, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `http://google.com/maps?q=${lat},${long}`))
        callback();
    })

    socket.on('disconnect', () => {
        /* no need to use broadcast here because client already disconnected, 
        so there's no chance that they get the message */
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left the room!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log('listening on port '+port+'!')
})



