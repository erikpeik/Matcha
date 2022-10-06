module.exports = (app, pool) => {
	app.get('/api/chat/chat_connections', async (request, response) => {
		const sess = request.session

		try {
			if (sess.userid) {
				var variables = [sess.userid]
				var sql = `SELECT * from connections WHERE user1_id = $1 OR user2_id = $1`
				var { rows } = await pool.query(sql, variables)
				var connected_user = []
				for (var i = 0; i < rows.length; i++) {
					var row = rows[i]
					if (row.user1_id === sess.userid) {
						connected_user.push({
							connection_id: row.connection_id,
							user_id: row.user2_id
						})
					} else {
						connected_user.push({
							connection_id: row.connection_id,
							user_id: row.user1_id
						})
					}
				}
				for (var i = 0; i < connected_user.length; i++) {
					variables = [connected_user[i].user_id]
					sql = `SELECT id, username from users WHERE users.id = $1`
					var { rows } = await pool.query(sql, variables)
					rows[0].connection_id = connected_user[i].connection_id

					sql = `SELECT picture_data from user_pictures
					WHERE user_id = $1 AND profile_pic = 'YES'`
					var { rows: picture_data } = await pool.query(sql, variables)
					rows[0].picture_data = picture_data[0].picture_data
					connected_user[i] = rows[0]
				}
				response.send(connected_user)
			} else {
				response.send(false)
			}
		} catch (err) {
			console.log(err)
		}
	})

	app.post('/api/chat/room_messages', async (request, response) => {
		const sess = request.session
		const connection_id = request.body.room
		try {
			if (sess.userid) {
				var variables = [connection_id]
				var sql = `SELECT message as text, sender_id, username as name, connection_id as room, chat_id as key FROM chat
				INNER JOIN users ON users.id = chat.sender_id
				WHERE connection_id = $1 ORDER BY time_stamp ASC`
				var { rows } = await pool.query(sql, variables)
				response.send(rows)
			} else {
				response.send(false)
			}
		} catch (err) {
			console.log(err)
		}
	})

	app.post('/api/chat/check_username', async (request, response) => {
		const sess = request.session
		const username = request.body.username
		if (sess.username) {
			if (sess.username === username) {
				response.send(true)
			} else {
				response.send(false)
			}
		} else {
			response.send(false)
		}
	})

	app.post('/api/chat/usernames', async (request, response) => {
		const body = request.body
		const sess = request.session

		try {
			if (sess.userid) {
				const variables = [sess.userid, sess.location[0], sess.location[1]]
				var sql = `SELECT * FROM
						(SELECT id, username, firstname, lastname, gender, age, sexual_pref,
						biography, fame_rating, user_location, picture_data AS profile_pic,
						calculate_distance($2, $3, ip_location[0], ip_location[1], 'K') AS distance,
						(SELECT COUNT(*) FROM tags WHERE tagged_users @> array[$1,users.id]) AS common_tags
						FROM users
						LEFT JOIN user_settings ON users.id = user_settings.user_id
						LEFT JOIN user_pictures ON users.id = user_pictures.user_id
						WHERE users.id != $1 AND users.verified = 'YES')AS x`
				var { rows } = await pool.query(sql, variables)
				var returnedRows = rows.map(user => {
					if (!user.profile_pic)
						return ({ ...user, profile_pic: "http://localhost:3000/images/default_profilepic.jpeg" })
					else
						return (user)
				})
				response.send(returnedRows)
			} else {
				response.send(false)
			}
		} catch (error) {
			response.send(error)
		}
	})
}
