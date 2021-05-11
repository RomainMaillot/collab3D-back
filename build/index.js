"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const body_parser_1 = require("body-parser");
const cors = require("cors");
const middlewares_1 = require("./middlewares");
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT || 9000;
const uri = process.env.PORT ? 'https://prod-url/' : 'http://localhost:8080';
// create matrix map
let matrixMap = new Map();
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
        origin: uri,
        methods: ["GET", "POST"]
    }
});
app.use(body_parser_1.json());
app.use(middlewares_1.authentification(['/user']));
app.use(cors());
app.get("/getRoomInfo/:room", function (request, response) {
    response.send(matrixMap.get(request.params.room));
});
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('create', function (room) {
        socket.join(room);
        console.log('roomKey: ', room);
        // set a matrix for a room
        matrixMap.set(room, { user: 1, sceneData: { objectPosition: [2, 2, 2] } });
    });
    socket.on('join', function (room) {
        socket.join(room);
        const user = matrixMap.get(room).user + 1;
        matrixMap.set(room, Object.assign(Object.assign({}, matrixMap.get(room)), { user: user }));
    });
    socket.on('test', function () {
        console.log('test socket');
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
server.listen(port, () => {
    console.log('🚀 Server is running on port', port);
});
//# sourceMappingURL=index.js.map