var express = require('express');
var cors = require('cors');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.use(cors());

server.listen(3001);

const chatSocket = io.of('/chat');
const roomsSocket = io.of('/rooms');

var usernames = {};
var rooms = {};

roomsSocket.on('connection', function(socket) {
	socket.emit('update', rooms);
});

chatSocket.on('connection', function (socket) {
	socket.on('create', function(username, room) {
		usernames[username] = username;
		rooms[room] = room;

		socket.username = username;
		socket.room = room;

		socket.join(room);

		roomsSocket.emit('update', rooms);

		console.log('New room: ' + room + ', Created by: ' + username);
		socket.emit('update', 'SERVER', 'You created new room: ' + room);
	});

	socket.on('join', function(username, room) {
		if (room in rooms) {
			usernames[username] = username;

			socket.username = username;
			socket.room = room;

			socket.join(room);

			console.log(username + ' has connected to ' + room);
			socket.emit('update', 'SERVER', 'You have connected to: ' + room);
			socket.broadcast.to(room).emit('update', 'SERVER', username + ' has connected to ' + room);
		} else {
			console.log('Room not founded: ' + room);
		}		
	});
	
	socket.on('send', function (data) {
		chatSocket.in(socket.room).emit('update', socket.username, data);
	});

	socket.on('disconnect', function() {
		delete usernames[socket.username];
		socket.leave(socket.room);
	});
});
