require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const router = require('./routes/routes');
const serverr = require('./server/server')
const port = process.env.PORT;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.use('/api', router);
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinPool', (poolId) => {
        socket.join(poolId);
        console.log(`Client joined pool: ${poolId}`);
    });

    socket.on('sendMessage', (data) => {
        const { poolId, senderId, message } = data;

        // Save the message to the database
        Pool.findById(poolId).then(pool => {
            pool.chat.push({
                sender: senderId,
                message: message,
                timestamp: new Date()
            });

            pool.save().then(() => {
                // Emit the message to all clients in the pool
                io.to(poolId).emit('receiveMessage', { senderId, message, timestamp: new Date() });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});
