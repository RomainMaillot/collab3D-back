"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const body_parser_1 = require("body-parser");
const cors = require("cors");
const SpotifyWebApi = require("spotify-web-api-node");
const qs = require("querystring");
const middlewares_1 = require("./middlewares");
const dotenv = require('dotenv');
dotenv.config();
let spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
});
const jssdkscopes = ["streaming", "user-read-email", "user-read-private", "user-modify-playback-state", "user-library-read"];
const redirectUriParameters = {
    client_id: process.env.CLIENT_ID,
    response_type: 'token',
    scope: jssdkscopes.join(' '),
    redirect_uri: encodeURI('http://localhost:3000/'),
    show_dialog: true,
};
const redirectUri = `https://accounts.spotify.com/authorize?${qs.stringify(redirectUriParameters)}`;
function authenticate(callback) {
    spotifyApi.clientCredentialsGrant()
        .then(function (data) {
        console.log('The access token expires in ' + data.body['expires_in']);
        console.log('The access token is ' + data.body['access_token']);
        callback instanceof Function && callback();
        // Save the access token so that it's used in future calls
        spotifyApi.setAccessToken(data.body['access_token']);
    }, function (err) {
        console.log('Something went wrong when retrieving an access token', err.message);
    });
}
authenticate(() => console.log('connected'));
const app = express();
app.use(body_parser_1.json());
app.use(middlewares_1.authentification(['/user']));
app.use(cors());
app.get('/', (req, res) => {
    console.log(req);
    res.send('Hello World');
});
app.get('/user/:id', (req, res) => {
    res.send(`Hello World ${req.params.id}`);
});
app.get('/getName', (req, res) => {
    res.send('Romain');
});
app.get("/spotifyRedirectUri", function (request, response) {
    response.send(JSON.stringify({
        redirectUri
    }, null, 2));
});
app.post('/user', (req, res) => {
    console.log(req.body);
    res.send('ok');
});
app.listen(9000, () => {
    console.log('🚀 Server is running');
});
//# sourceMappingURL=index.js.map