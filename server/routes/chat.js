module.exports = (http, pool) => {
	const socketIO = require('socket.io')(http, {
		cors: {
			origin: "http://localhost:3000"
		}
	});

	let users = []

	socketIO.on('connection', (socket) => {
		console.log('socket connected:', socket.id);

		socket.on('join_room', (data) => {
			console.log('join_room', `room-${data.room}`);
			socket.join(`room-${data.room}`);
		})

		socket.on('leave_room', (data) => {
			socket.leave(`room-${data.room}`);
		})

		socket.on('send_message', (data) => {
			const sendToDatabase = (data) => {
				var variables = [data.room, data.sender_id, data.text]
				var sql = `INSERT INTO chat (connection_id, sender_id, message)
				VALUES ($1, $2, $3)`
				pool.query(sql, variables)

				var notification = `You received a new message from ${data.name}`
				var sql = `INSERT INTO notifications (user_id, notification_text, redirect_path, sender_id) VALUES ($1,$2,$3)`
				pool.query(sql, [data.receiver_id, notification, '/chat', data.sender_id])
			}
			socketIO.in(`room-${data.room}`).emit('receive_message', data)
			sendToDatabase(data)
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
