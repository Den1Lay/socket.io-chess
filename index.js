const express = require('express');
const app = express()
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path')

const cors = require('cors');

app.use(cors())
app.use(express.json())
app.use(express.urlencoded())

app.use(express.static('client/build'))
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
})

let game = []
io.on('connection', function(socket){
  console.log(`New server connect: ${socket.id}`)
  socket.emit('HANDSHAKE', {socket: socket.id})
  socket.on('GAME:FINDING', () => {
    if (game.length === 0) {
      game.push(socket.id)
      console.log('Finding on server', game)
      socket.emit('GAME:START_FINDING')
    } else {
      socket.to(game[0]).emit('GAME:FIND', {partner: socket.id, position: 'light'})
      socket.emit('GAME:FIND', {partner: game[0], position: 'dark'})
      game = []
    }
  })
  socket.on('GAME:STOP_FINDING', () => {
    game.pop()
  })
  socket.on('GAME:MOVE', ({address, payload}) => socket.to(address).emit('GAME:MOVE', {payload}))
});

http.listen(4000, function(){
  console.log('listening on *:4000');
}); 