import * as express from 'express'
import { json } from 'body-parser'
import * as cors from 'cors'

import { authentification } from './middlewares'

const dotenv = require('dotenv')
dotenv.config()

const port = process.env.PORT || 9000;
const uri = process.env.PORT ? 'https://prod-url/' : 'http://localhost:8080'
// create matrix map
let matrixMap = new Map();

const app = express()
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
      origin: uri,
      methods: ["GET", "POST"]
    }
  })

app.use(json())
app.use(authentification(['/user']))
app.use(cors())

app.get("/getRoomInfo/:room", function (request, response) {
    response.send(matrixMap.get(request.params.room))
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('create', function(room) {
        socket.join(room)
        console.log('roomKey: ', room)
        // set a matrix for a room
        matrixMap.set(room, {user: 1, sceneData: {objects: []}})
    });

    socket.on('join', function(room) {
        socket.join(room)
        const user = matrixMap.get(room).user + 1
        matrixMap.set(room, {...matrixMap.get(room), user: user})
        socket.to(room).emit('userJoined', socket.id)
    });

    socket.on('initDatas', function(room, userId) {
        socket.to(userId).emit('initRoomData', matrixMap.get(room))
    });

    socket.on('addObject', function(room, objectId) {
        const objects = matrixMap.get(room).sceneData.objects
        objects.push({objectPosition: { x: 0, y: 0, z: 0 }, objectId})
        matrixMap.set(room, {...matrixMap.get(room), sceneData: {objects}})
        socket.to(room).emit('addObjectRoom')
    })

    socket.on('deleteObject', function(room, objectId) {
        const objects = matrixMap.get(room).sceneData.objects
        objects.filter(object => {
            return object.objectId !== objectId
        })
        matrixMap.set(room, {...matrixMap.get(room), sceneData: {objects}})
        socket.to(room).emit('deleteObjectInRoom', objectId)
    })

    socket.on('objectMoved', function(room, objectPosition, objectId) {
        const objects = matrixMap.get(room).sceneData.objects
        let addObject = 0
        for(const object of objects) {
            if(object.objectId == objectId) {
                object.objectPosition = objectPosition
                addObject++
            }
        }
        if(addObject === 0) {
            objects.push({objectPosition, objectId})
        }
        matrixMap.set(room, {...matrixMap.get(room), sceneData: {objects}})
        socket.to(room).emit('updateDatas', matrixMap.get(room))
    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(port, () => {
    console.log('🚀 Server is running on port', port)
})
