"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const body_parser_1 = require("body-parser");
const cors = require("cors");
const middlewares_1 = require("./middlewares");
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
app.post('/user', (req, res) => {
    console.log(req.body);
    res.send('ok');
});
app.listen(9000, () => {
    console.log('🚀 Server is running');
});
//# sourceMappingURL=index.js.map