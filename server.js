var express = require('express');

var app = express();
var server = app.listen(3000);

app.use(express.static('public'));

var socket = require('socket.io');
// inputs and outputs
var io = socket(server);

io.on('connection', newConnection);

function newConnection(socket) {
  console.log('new connection:' + socket.id);

  socket.on('mouse', mouseMsg);

  function mouseMsg(data) {
    io.emit('mouse', data);
    console.log(data);
  }
}
