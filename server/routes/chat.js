module.exports = (pool, socketIO) => {
	sendNotification = async (notification_id, notification, sender_id, target_id, redirect_address) => {
		if (sender_id) {
			var sql = `SELECT picture_data
						FROM user_pictures WHERE user_id = $1 AND profile_pic = 'YES'`
			const { rows } = await pool.query(sql, [sender_id])
			let picture = rows[0] ? rows[0]['picture_data'] : null
			var data = {
				id: notification_id,
				user_id: Number(target_id),
				sender_id: sender_id,
				text: notification,
				redirect_path: redirect_address,
				read: 'NO',
				picture,
				time_stamp: new Date()
			}
			socketIO.to(`notification-${target_id}`).emit('new_notification', data)
		}
	}

	let users = []

	socketIO.on('connection', (socket) => {
		console.log('socket connected:', socket.id);

		socket.on('join_room', (data) => {
			console.log('join_room', `room-${data.room}`);
			socket.join(`room-${data.room}`);
		})

		socket.on('join_notification', (data) => {
			console.log('join_notification', `notification-${data.id}`);
			socket.join(`notification-${data.id}`);
		})

		// socket.on('send_notification', (data) => {
		// 	console.log('send_notification', `notification-${data.id}`);
		// 	socketIO.to(`notification-${data.id}`).emit('new_notification', data)
		// })

		socket.on('leave_room', (data) => {
			socket.leave(`room-${data.room}`);
		})

		socket.on('send_message', (data) => {
			const sendToDatabase = async (data) => {
				var variables = [data.room, data.sender_id, data.text]
				var sql = `INSERT INTO chat (connection_id, sender_id, message)
							VALUES ($1, $2, $3)`
				pool.query(sql, variables)

				var notification = `You received a new message from ${data.name}`
				var sql = `INSERT INTO notifications (user_id, notification_text, redirect_path, sender_id)
							VALUES ($1,$2,$3,$4) RETURNING notification_id`
				const {rows} = await pool.query(sql, [data.receiver_id, notification,
					`/chat/${data.room}`, data.sender_id])

				sendNotification(rows[0]['notification_id'], notification, data.sender_id,
					data.receiver_id, `/chat/${data.room}`)
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
			disconnected_user = users.filter(user => user.socketID === socket.id)
			if (disconnected_user.length > 0) {
				var sql = `UPDATE users SET last_connection = NOW()::timestamp WHERE id = $1`
				pool.query(sql, [disconnected_user[0].id])
			}
			users = users.filter(user => user.socketID !== socket.id)
			console.log('users:', users)
			socketIO.emit('newUserResponse', users)
			socket.disconnect()
		})

		socket.on('logOut', (data) => {
			logged_out_user = users.filter(user => user.socketID === data.socketID)
			if (logged_out_user.length > 0) {
				var sql = `UPDATE users SET last_connection = NOW()::timestamp WHERE id = $1`
				pool.query(sql, [logged_out_user[0].id])
			}
			users = users.filter(user => user.socketID !== data.socketID)
			console.log("Logged out:", users)
			socketIO.emit('newUserResponse', users)
		})
	})

	socketIO.on("connect_error", (err) => {
		console.log(`connect_error due to ${err.message}`);
	})
}
