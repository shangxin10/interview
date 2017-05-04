var socketio = {};  
var socket_io = require('socket.io');  


// var data = new Map();


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
		socket.on('disconnect',async function(){
			let socketMap = vector.sockets.get(socket.rid);
			if(!vector.isEmpty(socketMap)){
				socketMap.delete(socket._id);
				console.log('delete socket');
			}

			console.log("user disconnect");
		})

		socket.on('message', function (message, socketId) {
			console.log("server message socketid=>",socketId)
			// log('Got message:', message);
	    // for a real app, would be room only (not broadcast)
			
			
			if(socketId && vector.sockets.get(socket.rid)){
				let targetSocket = vector.sockets.get(socket.rid).get(socketId);
				if(targetSocket){
					targetSocket.emit('message',message, socket._id);
					if(message.type==='answer'){
						// console.log("message ==>",message);
					}
					console.log("send success to ",socket._id);
				}
			}else{
				let socketMap = vector.sockets.get(socket.rid);
				if(!vector.isEmpty(socketMap)){
					for(let [key,targetSocket] of socketMap){
						if(key === socket._id){
							continue;
						}
						targetSocket.emit('message', message, socket._id);
					}
				}
				// socket.broadcast.emit('message', message, socket._id);
			}
		});

		socket.on('create or join', async function (room) {

			let socketMap = vector.sockets.get(room);
			if(vector.isEmpty(socketMap)){
				socketMap = new Map();
			}

			if(vector.isEmpty(socket._id)){
				socket._id = Date.now();
				socket.rid = room;
				socketMap.set(socket._id, socket);
			}
			console.log("=========================")
			vector.sockets.set(room, socketMap);
			var personCount = socketMap.size;
			if (personCount == 1){
				console.log("created=====>")
				// socket.join(room);
				socket.emit('created',room);
			} else {
				// socket.join(room);
				let socketArr = [];
				if(!vector.isEmpty(socketMap)){
					for(let [key,targetSocket] of socketMap){
						if(key === socket._id){
							continue;
						}
						socket.emit('joined', key);
						targetSocket.emit('join', socket._id);
					}
				}

			} 
			socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
			// socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);
		});
    })  
};  

module.exports = socketio;