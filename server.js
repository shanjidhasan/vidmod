const express = require('express')
const app = express()
const https = require('https')
const path = require('path')
const fs = require('fs')
// const cors = require('cors')
// app.use(cors())
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer')
const peerServer = ExpressPeerServer(server, {
  debug: true,
  port: 443,
  proxied: true,
  ssl: {key: fs.readFileSync('./ssl/example_com.key'),
  certificate: fs.readFileSync('./ssl/baartaa_com.crt')}},
  () => {
console.log('running peerserver')
  
})



const { v4: uuidV4 } = require('uuid')

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    console.log('+++\n','New user : ' , userId ,'\n', ' On Room : ' , roomId , '\n\n')
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId);
    // messages
    socket.on('message', (message) => {
      //send message to the same room
      io.to(roomId).emit('createMessage', message)
  }); 

    socket.on('disconnect', () => {
      console.log('---\n','User left : ' , userId ,'\n', 'From Room : ' , roomId , '\n\n')
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
      
    })
  })
})

server.listen(443);
//

