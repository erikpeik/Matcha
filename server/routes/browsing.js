module.exports = (app, pool, transporter, session) => {

	app.post('/api/browsing/sorted', async (request, response) => {
		const body = request.body
		const sess = request.session

		try {
			if (sess.userid) {
				const variables = [sess.userid, body.min_age, body.max_age, body.min_fame, body.max_fame,
				sess.location[0], sess.location[1], body.min_distance, body.max_distance]
				console.log("Variables: ", body, sess.location[0], sess.location[1])
				var sql = `SELECT id, username, firstname, lastname, gender, age, sexual_pref,
						biography, fame_rating, user_location, picture_data AS profile_pic, blocker_id, target_id,
						calculate_distance($6, $7, ip_location[0], ip_location[1], 'K') AS distance,
						(SELECT COUNT(*) FROM tags WHERE tagged_users @> array[$1,users.id]) AS common_tags
						FROM users
						INNER JOIN user_settings ON users.id = user_settings.user_id
						INNER JOIN user_pictures ON users.id = user_pictures.user_id AND user_pictures.profile_pic = 'YES'
						LEFT JOIN blocks ON (users.id = blocks.target_id AND blocks.blocker_id = $1) OR
											(users.id = blocks.blocker_id AND blocks.target_id = $1)
						WHERE users.id != $1 AND users.verified = 'YES' AND blocker_id IS NULL AND target_id IS NULL
						AND age BETWEEN $2 and $3 AND fame_rating BETWEEN $4 AND $5
						AND calculate_distance($6, $7, ip_location[0], ip_location[1], 'K') BETWEEN $8 and $9
						ORDER BY username`;
				var { rows } = await pool.query(sql, variables)

				var returnedRows = rows.map(user => {
					if (!user.profile_pic)
						return ({ ...user, profile_pic: "http://localhost:3000/images/default_profilepic.jpeg" })
					else
						return (user)
				})
				console.log("Browsing Data To Show: ", returnedRows)
				response.send(returnedRows)
			} else {
				response.send(false)
			}
		} catch (error) {
			response.send(error)
		}
	})

	app.post('/api/browsing/likeuser/:id', async (request, response) => {
		const sess = request.session

		if (sess.userid) {
			console.log("Liking user...")
			var sql = `SELECT picture_data FROM user_pictures
						INNER JOIN users ON user_pictures.user_id = users.id
						WHERE user_pictures.user_id = $1 AND user_pictures.profile_pic = 'YES'`
			const { rows } = await pool.query(sql, [sess.userid])

			if (rows[0]['picture_data'] === 'http://localhost:3000/images/default_profilepic.jpeg') {
				return response.send('No profile picture')
			} else {
				const liked_person_id = request.params.id

				var sql = `INSERT INTO likes (liker_id, target_id) VALUES ($1, $2);`
				await pool.query(sql, [sess.userid, liked_person_id])

				var notification = `You have been liked by user ${sess.username}`
				var sql = `INSERT INTO notifications (user_id, notification_text) VALUES ($1,$2)`
				pool.query(sql, [liked_person_id, notification])

				var sql = `SELECT * FROM likes WHERE liker_id = $2 AND target_id = $1`
				const reverseliked = await pool.query(sql, [sess.userid, liked_person_id])

				if (reverseliked.rows.length !== 0) {
					var sql = `INSERT INTO connections (user1_id, user2_id) VALUES ($1, $2)`
					await pool.query(sql, [sess.userid, liked_person_id])

					var notification = `You have been liked back by user ${sess.username}!
										You are now connected and are able to chat with each other.`
					var sql = `INSERT INTO notifications (user_id, notification_text) VALUES ($1,$2)`
					pool.query(sql, [liked_person_id, notification])
				}
				console.log("Liked user!")
				response.status(200).send("Liked user!")
			}
		}
	})

	app.post('/api/browsing/unlikeuser/:id', async (request, response) => {
		const sess = request.session

		if (sess.userid) {
			const unliked_person_id = request.params.id

			var sql = `DELETE FROM likes WHERE liker_id = $1 AND target_id = $2`
			await pool.query(sql, [sess.userid, unliked_person_id])

			var sql = `DELETE FROM connections
					WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)
					RETURNING *`
			const { rows } = await pool.query(sql, [sess.userid, unliked_person_id])

			if (rows.length !== 0) {
				var notification = `The user ${sess.username} just unliked you.
					This means your connection has been lost and you can no longer chat with each other. :(`
				var sql = `INSERT INTO notifications (user_id, notification_text) VALUES ($1,$2)`
				pool.query(sql, [unliked_person_id, notification])
			}

			response.status(200).send("Unliked user!")
		}
	})

	app.post('/api/browsing/blockuser/:id', async (request, response) => {
		const sess = request.session

		if (sess.userid) {
			const blocked_person_id = request.params.id

			var sql = `INSERT INTO blocks (blocker_id, target_id) VALUES ($1, $2)`
			await pool.query(sql, [sess.userid, blocked_person_id])

			var sql = `DELETE FROM likes WHERE (liker_id = $1 AND target_id = $2) OR (liker_id = $2 AND target_id = $1)`
			await pool.query(sql, [sess.userid, blocked_person_id])

			var sql = `DELETE FROM connections
					WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)`
			await pool.query(sql, [sess.userid, blocked_person_id])

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
							to: 'matchamail4u@gmail.com',
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
			console.log("Getting likes...")
			const likedusers = await pool.query(sql, [sess.userid])
			const likedUserIds = likedusers.rows.map(user => user.target_id)

			var sql = `SELECT user2_id FROM connections WHERE user1_id = $1`
			console.log("Getting connections...")
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
			console.log("Getting blocks...")
			const blockedusers = await pool.query(sql, [sess.userid])
			const blockedUserIds = blockedusers.rows.map(user => user.target_id)

			const userLists = { liked: likedUserIds, connected: connectedUserIds, blocked: blockedUserIds }
			console.log("Userlists: ", userLists)
			response.send(userLists)
		}
	})

	app.get('/api/browsing/userprofile/:id', async (request, response) => {
		const sess = request.session

		if (sess.userid) {
			try {
				const profile_id = request.params.id
				var sql = `SELECT * FROM users
						INNER JOIN user_settings ON users.id = user_settings.user_id
						WHERE users.id = $1`
				var { rows } = await pool.query(sql, [profile_id])
				// console.log("Profile Data: ", rows[0])
				const { password: removed_password, ...profileData } = rows[0]
				// console.log("Profile Data: ", profileData)

				var sql = `SELECT * FROM tags WHERE tagged_users @> array[$1]::INT[]
						ORDER BY tag_id`
				var tags = await pool.query(sql, [profile_id])

				profileData.tags = tags.rows.map(tag => tag.tag_content)

				var sql = `SELECT * FROM user_pictures WHERE user_id = $1 AND profile_pic = 'YES'`
				var profile_pic = await pool.query(sql, [profile_id])

				if (profile_pic.rows[0]) {
					profileData.profile_pic = profile_pic.rows[0]
				} else {
					profileData.profile_pic = { user_id: sess.userid, picture_data: 'http://localhost:3000/images/default_profilepic.jpeg' }
				}
				// console.log(profile_pic.rows[0]['picture_data'])

				var sql = `SELECT * FROM user_pictures WHERE user_id = $1 AND profile_pic = 'NO' ORDER BY picture_id`
				var other_pictures = await pool.query(sql, [profile_id])
				// console.log(other_pictures.rows)
				if (other_pictures.rows) {
					profileData.other_pictures = other_pictures.rows
				}

				var sql = `INSERT INTO watches (watcher_id, target_id) VALUES ($1,$2)`
				pool.query(sql, [sess.userid, profile_id])

				var notification = `The user ${sess.username} just checked your profile`
				var sql = `INSERT INTO notifications (user_id, notification_text) VALUES ($1,$2)`
				pool.query(sql, [profile_id, notification])

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
}
