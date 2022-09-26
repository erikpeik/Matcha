module.exports = (http) => {
	const socketIO = require('socket.io')(http, {
		cors: {
			origin: "http://localhost:3000"
		}
	});

	let users = []

	socketIO.on('connection', (socket) => {
		console.log('socket connected:', socket.id);

		socket.on('message', (data) => {
			socketIO.emit('messageResponse', data)
		})

		socket.on('newUser', (data) => {
			console.log("data:", data)
			const userNames = users.map(user => user.name)
			console.log("Usernames: ", userNames)
			if (userNames.includes(data.name) === false) {
				if (data.socketID) {
					users.push(data)
				}
			}
			console.log("users:", users)
			socketIO.emit('newUserResponse', users)
		})

		socket.on('disconnect', () => {
			console.log('socket disconnected: ', socket.id);
			users = users.filter(user => user.socketID !== socket.id)
			console.log('users:', users)
			socketIO.emit('newUserResponse', users)
			socket.disconnect()
		})

		socket.on('typing', (data) => {
			socket.broadcast.emit('typingResponse', data)
		})

		socket.on('logOut', (data) => {
			users = users.filter(user => user.socketID !== data.socketID)
			console.log("Logged out:", users)
			socketIO.emit('newUserResponse', users)
		})
	})

	socketIO.on("connect_error", (err) => {
		console.log(`connect_error due to ${err.message}`);
	})
}
