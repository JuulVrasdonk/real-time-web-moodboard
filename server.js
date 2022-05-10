require('dotenv').config()
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const path = require('path')
const io = require('socket.io')(http)
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
const apiKey = process.env.KEY

const port = 2022

app.set('view engine', 'ejs')
app.set('views', './views')

app.use(express.static(path.resolve('public')))

app.get('/', function (req, res) {
  const key = `https://api.unsplash.com/search/photos/?client_id=${apiKey}&query=${req.query.q}`

  console.log(key);
  fetch(key)
    .then(async response => {
      const data = await response.json()
      const results = data.results
      console.log(results);

      res.render('index', {
        results
      })
    } 
    )
})


io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('message', (message) => {
    io.emit('message', message)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

  socket.on('mouse', (data) =>  {
    socket.broadcast.emit('mouse', data);
  })

  socket.on('image', (source) =>  {
    socket.broadcast.emit('image', source);
  })
  
})


http.listen(port, () => {
  console.log('listening on port ', port)
})
