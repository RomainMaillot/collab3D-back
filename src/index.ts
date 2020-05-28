import * as express from 'express'
import { json } from 'body-parser'
import * as cors from 'cors'
import * as SpotifyWebApi from 'spotify-web-api-node'
import * as qs from 'querystring'

import { authentification } from './middlewares'

const dotenv = require('dotenv')
dotenv.config()

const port = process.env.PORT || 9000;
const uri = process.env.PORT ? 'https://3d-dj.netlify.app/' : 'http://localhost:3000/'

let spotifyApi = new SpotifyWebApi({
    clientId : process.env.CLIENT_ID,
    clientSecret : process.env.CLIENT_SECRET,
});

const jssdkscopes = ["streaming", "user-read-email", "user-read-private", "user-modify-playback-state", "user-library-read"];
const redirectUriParameters = {
  client_id: process.env.CLIENT_ID,
  response_type: 'token',
  scope: jssdkscopes.join(' '),
  redirect_uri: encodeURI(uri),
  show_dialog: true,
}

const redirectUri = `https://accounts.spotify.com/authorize?${qs.stringify(redirectUriParameters)}`

function authenticate(callback) {
    spotifyApi.clientCredentialsGrant()
    .then(function(data) {
    console.log('The access token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);
    
    callback instanceof Function && callback();

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);
    }, function(err) {
        console.log(redirectUri)
    console.log('Something went wrong when retrieving an access token', err.message);
    });
}
authenticate(() => console.log('connected'));

const app = express()
const server = require('http').Server(app);
const io = require('socket.io')(server, { origins: '*:*'});

app.use(json())
app.use(authentification(['/user']))
app.use(cors())

app.get('/', (req, res) => {
    console.log(req)
    res.send('Hello World')
})

app.get('/user/:id', (req, res) => {
    res.send(`Hello World ${req.params.id}`)
})

app.get('/getName', (req, res) => {
    res.send('Romain')
})

app.get("/spotifyRedirectUri", function (request, response) {
    response.send(JSON.stringify({
      redirectUri
    }, null, 2))
});

app.post('/user', (req, res) => {
    console.log(req.body)
    res.send('ok')
})

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('chat message', (data) => {
        console.log(data);
        if(data.room) {
            socket.to(data.room).emit('chat message', data);
        } else {
            io.emit('chat message', data);
        }
    })

    socket.on('create', function(room) {
        socket.join(room)
    });

    socket.on('join', function(room) {
        socket.join(room)
        socket.to(room).emit('user-join');
    });

    socket.on('resume', function(data) {
        socket.to(data.room).emit('resume', data);
    });

    socket.on('pause', function(data) {
        socket.to(data.room).emit('pause', data);
    });

    socket.on('changeSong', function(data) {
        socket.to(data.room).emit('changeSong', data);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('disconnecting', () => {
        let room = Object.keys(socket.rooms)[0];
        socket.to(room).emit('user-leave');
    });
});

server.listen(port, () => {
    console.log('🚀 Server is running')
})
