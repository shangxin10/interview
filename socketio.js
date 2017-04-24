var socketio = {};  
var socket_io = require('socket.io');  


var data = new Map();


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
			let socketMap = data.get(socket.rid);
			if(!vector.isEmpty(socketMap)){
				socketMap.delete(socket._id);
				console.log('delete socket');
			}
			console.log("user disconnect");
		})
		socket.on('message', function (message) {
			log('Got message:', message);
	    // for a real app, would be room only (not broadcast)
			socket.broadcast.emit('message', message);
		});

		socket.on('create or join', function (room) {

			let socketMap = data.get(room);
			if(vector.isEmpty(socketMap)){
				socketMap = new Map();
			}

			if(vector.isEmpty(socket._id)){
				socket._id = Date.now();
				socket.rid = room;
				socketMap.set(socket._id, socket);
			}
			data.set(room, socketMap);

			console.log("socketMap.size", socketMap.size)
			console.log("data.size", data.size)
			// var roomObj = io.sockets.adapter.rooms[room];
			// console.log("numClients",roomObj);
			var numClients = socketMap.size;
			// if(roomObj != null){
			// 	numClients = roomObj.length;
			// }
			log('Room ' + room + ' has ' + numClients + ' client(s)');
			log('Request to create or join room ' + room);
			if (numClients === 1){
				socket.join(room);
				socket.emit('created', room);
				// var test = io.sockets.adapter.rooms;
				// console.log("numClients",test);
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