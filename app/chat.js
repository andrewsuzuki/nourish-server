module.exports = function(io) {
  // TODO
  
  io.on('connection', function(socket) {
    console.log('A user connected!');

    socket.on('chat message', function(message) {
      console.log('New message: ' + message);
    })
  });
};
