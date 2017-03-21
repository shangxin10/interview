
var socketio = {};  
var socket_io = require('socket.io');  
  
//获取io  
socketio.getSocketio = function(server){  
  
    var io = socket_io.listen(server);  
  
    io.on('connection', function (socket) {
    	console.log("user connect"); 
        // convenience function to log server messages on the client
		function log(){
		  var array = [">>> Message from server: "];
		  for (var i = 0; i < arguments.length; i++) {
		  	array.push(arguments[i]);
		  }
		  socket.emit('log', array);
		}
		socket.on('disconnect',function(){
			console.log("user disconnect");
		})
		socket.on('message', function (message) {
			log('Got message:', message);
	    // for a real app, would be room only (not broadcast)
			socket.broadcast.emit('message', message);
		});

		socket.on('create or join', function (room) {
			console.log("rooms",socket.rooms);
			var roomObj = io.sockets.adapter.rooms[room];
			console.log("numClients",roomObj);
			var numClients = 0;
			if(roomObj != null){
				numClients = roomObj.length;
			}
			log('Room ' + room + ' has ' + numClients + ' client(s)');
			log('Request to create or join room ' + room);
			if (numClients === 0){
				socket.join(room);
				socket.emit('created', room);
				var test = io.sockets.adapter.rooms;
				console.log("numClients",test);
			} else {
				io.sockets.in(room).emit('join', room);
				socket.join(room);
				socket.emit('joined', room);
			} 
			socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
			socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);
		});
    })  
};  

module.exports = socketio;