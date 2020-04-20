import * as express from 'express'
import { json } from 'body-parser'
import * as cors from 'cors'

import { authentification } from './middlewares'

const app = express()

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

app.post('/user', (req, res) => {
    console.log(req.body)
    res.send('ok')
})

app.listen(9000, () => {
    console.log('🚀 Server is running')
})

