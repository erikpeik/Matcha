module.exports = (app, pool, transporter, socketIO) => {

	const sendNotification = async (userid, notification_id, notification, target_id, redirect_address) => {
		if (userid) {
			var sql = `SELECT picture_data
						FROM user_pictures WHERE user_id = $1 AND profile_pic = 'YES'`
			const { rows } = await pool.query(sql, [userid])
			let picture = rows[0] ? rows[0]['picture_data'] : null
			var data = {
				id: notification_id,
				user_id: Number(target_id),
				sender_id: userid,
				text: notification,
				redirect_path: redirect_address,
				read: 'NO',
				picture,
				time_stamp: new Date()
			}
			socketIO.to(`notification-${target_id}`).emit('new_notification', data)
		}
	}

	app.post('/api/browsing/sorted', async (request, response) => {
		const body = request.body
		const sess = request.session

		if (sess.userid && sess.location) {
			try {
				const variables = [sess.userid, body.min_age, body.max_age, body.min_fame, body.max_fame,
				sess.location.x, sess.location.y, body.min_distance, body.max_distance]
				var sql = `SELECT id, username, firstname, lastname, gender, age, sexual_pref,
						biography, total_pts AS fame_rating, user_location, picture_data AS profile_pic,
						blocker_id, target_id,
						calculate_distance($6, $7, ip_location[0], ip_location[1], 'K') AS distance,
						(SELECT COUNT(*) FROM tags WHERE tagged_users @> array[$1,users.id]) AS common_tags
						FROM users
						INNER JOIN user_settings ON users.id = user_settings.user_id
						INNER JOIN fame_rates ON users.id = fame_rates.user_id
						LEFT JOIN user_pictures ON users.id = user_pictures.user_id AND user_pictures.profile_pic = 'YES'
						LEFT JOIN blocks ON (users.id = blocks.target_id AND blocks.blocker_id = $1) OR
											(users.id = blocks.blocker_id AND blocks.target_id = $1)
						WHERE users.id != $1 AND users.verified = 'YES' AND blocker_id IS NULL AND target_id IS NULL
						AND age BETWEEN $2 and $3 AND total_pts BETWEEN $4 AND $5
						AND calculate_distance($6, $7, ip_location[0], ip_location[1], 'K') BETWEEN $8 and $9
						ORDER BY username`;
				var { rows } = await pool.query(sql, variables)

				for (let i = 0; i < rows.length; i++) {
					var sql = `SELECT tag_content FROM tags WHERE tagged_users @> array[$1]::INT[]`
					var { rows: tags } = await pool.query(sql, [rows[i].id])
					for (let j = 0; j < tags.length; j++) {
						tags[j] = tags[j].tag_content
					}
					rows[i].tags = tags
				}
				response.send(rows)
			} catch (error) {
				response.send("Fetching users failed")
			}
		} else {
			response.send(false)
		}
	})

	app.post('/api/browsing/likeuser/:id', async (request, response) => {
		const sess = request.session

		if (sess.userid) {
			var sql = `SELECT picture_data FROM user_pictures
						WHERE user_id = $1 AND profile_pic = 'YES'`
			const { rows } = await pool.query(sql, [sess.userid])
			if (rows[0] == undefined || rows[0]['picture_data'] === null || rows[0]['picture_data'] === 'http://localhost:3000/images/default_profilepic.jpeg') {
				return response.send('No profile picture')
			} else {
				const liked_person_id = request.params.id

				// preventing multiple press of the like button
				var sql = `SELECT * FROM likes WHERE liker_id = $1 AND target_id = $2`
				const oldLikes = await pool.query(sql, [sess.userid, liked_person_id])

				if (oldLikes.rows.length === 0) {
					var sql = `INSERT INTO likes (liker_id, target_id) VALUES ($1, $2)`
					await pool.query(sql, [sess.userid, liked_person_id])

					var sql = `UPDATE fame_rates SET like_pts = like_pts + 10, total_pts = total_pts + 10
							WHERE user_id = $1 AND like_pts <= 40 AND total_pts <= 90`
					pool.query(sql, [liked_person_id])

					var sql = `SELECT * FROM likes WHERE liker_id = $2 AND target_id = $1`
					const reverseliked = await pool.query(sql, [sess.userid, liked_person_id])

					var sql = `SELECT * FROM connections
							WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)`
					const oldConnections = await pool.query(sql, [sess.userid, liked_person_id])

					if (reverseliked.rows.length !== 0 && oldConnections.rows.length === 0) {
						var sql = `INSERT INTO connections (user1_id, user2_id) VALUES ($1, $2) RETURNING connection_id`
						const room_id = await pool.query(sql, [sess.userid, liked_person_id])

						let notification = `You have been liked back by user ${sess.username}!
										You are now connected and are able to chat with each other.`
						var sql = `INSERT INTO notifications (user_id, notification_text, redirect_path, sender_id)
									VALUES ($1,$2, $3, $4) RETURNING notification_id`
						let inserted_id = await pool.query(sql, [liked_person_id, notification,
							`/chat/${room_id.rows[0]['connection_id']}`, sess.userid])

						sendNotification(sess.userid, inserted_id.rows[0]['notification_id'], notification,
							liked_person_id, `/chat/${room_id.rows[0]['connection_id']}`)

						notification = `You are now matched with a new user and are able to chat with each other! Click here to start!`
						var sql = `INSERT INTO notifications (user_id, notification_text, redirect_path, sender_id)
						VALUES ($1,$2, $3, $4) RETURNING notification_id`
						inserted_id = await pool.query(sql, [sess.userid, notification,
							`/chat/${room_id.rows[0]['connection_id']}`, liked_person_id])

						sendNotification(liked_person_id, inserted_id.rows[0]['notification_id'], notification,
							sess.userid, `/chat/${room_id.rows[0]['connection_id']}`)

						var sql = `UPDATE fame_rates SET connection_pts = connection_pts + 5, total_pts = total_pts + 5
								WHERE (user_id = $1 AND connection_pts <= 25 )
								OR (user_id = $2 AND connection_pts <= 25)`
						pool.query(sql, [liked_person_id, sess.userid])
					} else {

						var notification = `You have been liked by user ${sess.username}`
						var sql = `INSERT INTO notifications (user_id, notification_text, redirect_path, sender_id) VALUES ($1,$2,$3,$4) RETURNING notification_id`
						var inserted_id = await pool.query(sql, [liked_person_id, notification, `/profile/${sess.userid}`, sess.userid])

						sendNotification(sess.userid, inserted_id.rows[0]['notification_id'], notification,
							liked_person_id, `/profile/${sess.userid}`)
					}
				}
				response.status(200).send("Liked user!")
			}
		}
	})

	app.post('/api/browsing/unlikeuser/:id', async (request, response) => {
		const sess = request.session

		if (sess.userid) {
			const unliked_person_id = request.params.id

			let sql = `DELETE FROM likes WHERE liker_id = $1 AND target_id = $2`
			await pool.query(sql, [sess.userid, unliked_person_id])

			sql = `SELECT * FROM likes WHERE target_id = $1`
			const likes = await pool.query(sql, [unliked_person_id])

			if (likes.rows.length < 5) {
				sql = `UPDATE fame_rates SET like_pts = like_pts - 10, total_pts = total_pts - 10
						WHERE user_id = $1`
				await pool.query(sql, [unliked_person_id])
			}

			sql = `DELETE FROM connections
					WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)
					RETURNING *`
			const { rows } = await pool.query(sql, [sess.userid, unliked_person_id])

			if (rows.length !== 0) {
				var notification = `The user ${sess.username} just unliked you.
					This means your connection has been lost and you can no longer chat with each other. :(`
				sql = `INSERT INTO notifications (user_id, notification_text, sender_id) VALUES ($1,$2,$3)
							RETURNING notification_id`
				const inserted_id = await pool.query(sql, [unliked_person_id, notification, sess.userid])

				sendNotification(sess.userid, inserted_id.rows[0]['notification_id'], notification,
					unliked_person_id, null)

				sql = `SELECT * FROM connections WHERE user1_id = $1 OR user2_id = $1`
				const connections = await pool.query(sql, [unliked_person_id])

				if (connections.rows.length < 6) {
					sql = `UPDATE fame_rates SET connection_pts = connection_pts - 5, total_pts = total_pts - 5
								WHERE user_id = $1`
					await pool.query(sql, [unliked_person_id])
				}
			}

			response.status(200).send("Unliked user!")
		}
	})

	app.post('/api/browsing/blockuser/:id', async (request, response) => {
		const sess = request.session

		if (sess.userid) {
			const blocked_person_id = request.params.id

			let sql = `SELECT * FROM blocks WHERE blocker_id = $1 AND target_id = $2`
			const already_blocked = await pool.query(sql, [sess.userid, blocked_person_id])

			if (already_blocked.rows.length > 0)
				return response.send("You have already blocked this user!")

			sql = `INSERT INTO blocks (blocker_id, target_id) VALUES ($1, $2)`
			await pool.query(sql, [sess.userid, blocked_person_id])

			sql = `DELETE FROM likes WHERE (liker_id = $1 AND target_id = $2) OR (liker_id = $2 AND target_id = $1)`
			await pool.query(sql, [sess.userid, blocked_person_id])

			sql = `SELECT * FROM likes WHERE target_id = $1`
			const likes = await pool.query(sql, [blocked_person_id])

			if (likes.rows.length < 5 && likes.rows.length > 0) {
				sql = `UPDATE fame_rates SET like_pts = like_pts - 10, total_pts = total_pts - 10
						WHERE user_id = $1`
				await pool.query(sql, [blocked_person_id])
			}

			sql = `DELETE FROM connections
					WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)`
			await pool.query(sql, [sess.userid, blocked_person_id])

			sql = `SELECT * FROM connections WHERE user1_id = $1 OR user2_id = $1`
			const connections = await pool.query(sql, [blocked_person_id])

			if (connections.rows.length < 6 && connections.rows.length > 0) {
				sql = `UPDATE fame_rates SET connection_pts = connection_pts - 5, total_pts = total_pts - 5
								WHERE user_id = $1`
				await pool.query(sql, [blocked_person_id])
			}

			response.status(200).send("Blocked user!")
		}
	})

	app.post('/api/browsing/reportuser/:id', async (request, response) => {
		const sess = request.session

		if (sess.userid) {
			try {
				const reported_person_id = request.params.id

				var sql = `SELECT * FROM reports WHERE sender_id = $1 AND target_id = $2`
				var reports = await pool.query(sql, [sess.userid, reported_person_id])

				if (reports.rows.length === 0) {

					var sql = `INSERT INTO reports (sender_id, target_id) VALUES ($1, $2)`
					await pool.query(sql, [sess.userid, reported_person_id])

					var sql = `SELECT username FROM users WHERE id = $1`
					var { rows } = await pool.query(sql, [reported_person_id])

					const sendReportMail = (username, id, sender_id) => {

						var mailOptions = {
							from: process.env.EMAIL_ADDRESS,
							to: process.env.EMAIL_ADDRESS,
							subject: 'Matcha user reported as fake account',
							html: `<h1>Hello!</h1>
								<p>Bad news, admin. Someone on Matcha just reported a user as a fake account.</p>
								<p>The reported person's username is ${username} and user_id is ${id}.</p>
								<p>The person who reported this has the user_id ${sender_id}.</p>
								<p>Please investigate.</p>
								<p>Love, Matcha Mail</p>`
						};

						transporter.sendMail(mailOptions, function (error, info) {
							if (error) {
								console.log(error);
							} else {
								console.log('Email sent: ' + info.response);
							}
						});
					}

					sendReportMail(rows[0]['username'], reported_person_id, sess.userid)

					response.status(200).send("Reported user!")
				} else {
					response.send("You have already reported this user. Our staff is dealing with the matter.")
				}
			} catch (error) {
				console.log(error)
			}
		}
	})

	app.get('/api/browsing/userlists', async (request, response) => {
		const sess = request.session
		if (sess.userid) {
			var sql = `SELECT target_id FROM likes WHERE liker_id = $1`
			const likedusers = await pool.query(sql, [sess.userid])
			const likedUserIds = likedusers.rows.map(user => user.target_id)

			var sql = `SELECT user2_id FROM connections WHERE user1_id = $1`
			var results1 = await pool.query(sql, [sess.userid])
			var sql = `SELECT user1_id FROM connections WHERE user2_id = $1`
			var results2 = await pool.query(sql, [sess.userid])
			const connectedusers = results1.rows.concat(results2.rows)
			const connectedUserIds = connectedusers.map(result => {
				if (result.user1_id)
					return (result.user1_id)
				else if (result.user2_id)
					return (result.user2_id)
			})

			var sql = `SELECT target_id FROM blocks WHERE blocker_id = $1`
			const blockedusers = await pool.query(sql, [sess.userid])
			const blockedUserIds = blockedusers.rows.map(user => user.target_id)

			const userLists = { liked: likedUserIds, connected: connectedUserIds, blocked: blockedUserIds }
			response.send(userLists)
		} else {
			response.send(false)
		}
	})

	app.get('/api/browsing/profile/:id', async (request, response) => {
		const sess = request.session

		if (sess.userid) {
			try {
				const profile_id = request.params.id
				var sql = `SELECT *,
						TO_CHAR(last_connection AT time zone 'UTC' AT time zone 'Europe/Helsinki', 'dd.mm.yyyy hh24:mi:ss') AS connection_time
						FROM users
						INNER JOIN user_settings ON users.id = user_settings.user_id
						INNER JOIN fame_rates ON users.id = fame_rates.user_id
						WHERE users.id = $1`
				var { rows } = await pool.query(sql, [profile_id])
				const { password: removed_password, ...profileData } = rows[0]

				var sql = `SELECT * FROM tags WHERE tagged_users @> array[$1]::INT[]
						ORDER BY tag_id`
				var tags = await pool.query(sql, [profile_id])

				profileData.tags = tags.rows.map(tag => tag.tag_content)

				var sql = `SELECT * FROM user_pictures WHERE user_id = $1 AND profile_pic = 'YES'`
				var profile_pic = await pool.query(sql, [profile_id])

				if (profile_pic.rows[0]) {
					profileData.profile_pic = profile_pic.rows[0]
				} else {
					profileData.profile_pic = { user_id: sess.userid, picture_data: null }
				}
				var sql = `SELECT * FROM user_pictures WHERE user_id = $1 AND profile_pic = 'NO' ORDER BY picture_id`
				var other_pictures = await pool.query(sql, [profile_id])
				if (other_pictures.rows) {
					profileData.other_pictures = other_pictures.rows
				}

				var sql = `INSERT INTO watches (watcher_id, target_id) VALUES ($1,$2)`
				pool.query(sql, [sess.userid, profile_id])

				var notification = `The user ${sess.username} just checked your profile`
				var sql = `INSERT INTO notifications (user_id, notification_text, redirect_path, sender_id)
							VALUES ($1,$2, $3, $4) RETURNING notification_id`
				const inserted_id = await pool.query(sql, [profile_id, notification, `/profile/${sess.userid}`, sess.userid])

				sendNotification(sess.userid, inserted_id.rows[0]['notification_id'], notification,
					profile_id, `/profile/${sess.userid}`)

				response.send(profileData)
			} catch (error) {
				response.send(false)
			}
		}
	})

	app.get('/api/browsing/tags', async (request, response) => {
		var sql = "SELECT * FROM tags ORDER BY tag_content"
		const { rows } = await pool.query(sql)

		response.send(rows)
	})

	app.get('/api/browsing/user_tags/:id', async (request, response) => {
		const user_id = request.params.id
		var sql = `SELECT * FROM tags WHERE tagged_users @> array[$1]::INT[]`
		const { rows } = await pool.query(sql, [user_id])

		response.send(rows)
	})
}
