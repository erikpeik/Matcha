module.exports = (app, pool, session) => {

	app.get('/api/browsing', async (request, response) => {
		const sess = request.session

		try {
			if (sess.userid) {
				var sql = `SELECT id, username, firstname, lastname, gender, age, sexual_pref,
						biography, fame_rating, user_location, picture_data AS profile_pic,
						calculate_distance($2, $3, ip_location[0], ip_location[1], 'K') AS distance
						FROM users
						LEFT JOIN user_settings ON users.id = user_settings.user_id
						LEFT JOIN user_pictures ON users.id = user_pictures.user_id
						WHERE users.id != $1`
				var { rows } = await pool.query(sql, [sess.userid, sess.location[0], sess.location[1]])
				// console.log("Browsing Data: ", rows)
				const browsingData = rows
				// console.log("Browsing Data: ", browsingData)

				// var sql = `SELECT * FROM user_pictures WHERE user_id != $1 AND profile_pic = 'YES'`
				// var profile_pic = await pool.query(sql, [sess.userid])

				// if (profile_pic.rows[0]) {
				// 	profileData.profile_pic = profile_pic.rows[0]['picture_data']
				// }
				// // console.log(profile_pic.rows[0]['picture_data'])

				// var sql = `SELECT * FROM user_pictures WHERE user_id != $1 AND profile_pic = 'NO'`
				// var other_pictures = await pool.query(sql, [sess.userid])
				// // console.log(other_pictures.rows)
				// if (other_pictures.rows) {
				// 	profileData.other_pictures = other_pictures.rows
				// }
				response.send(browsingData)
			} else {
				response.send(false)
			}
		} catch (error) {
			response.send(error)
		}
	})

	app.post('/api/browsing/sorted', async (request, response) => {
		const body = request.body
		const sess = request.session

		try {
			if (sess.userid) {
				const variables = [sess.userid, body.min_age, body.max_age, body.min_fame, body.max_fame, body.sorting, body.sort_order,
				sess.location[0], sess.location[1], body.min_distance, body.max_distance]
				console.log("Variables: ", body, sess.location[0], sess.location[1])
				var sql = `SELECT id, username, firstname, lastname, gender, age, sexual_pref,
						biography, fame_rating, user_location, picture_data AS profile_pic,
						calculate_distance($8, $9, ip_location[0], ip_location[1], 'K') AS distance
						FROM users
						LEFT JOIN user_settings ON users.id = user_settings.user_id
						LEFT JOIN user_pictures ON users.id = user_pictures.user_id
						WHERE users.id != $1 AND users.verified = 'YES'
						AND age BETWEEN $2 and $3 AND fame_rating BETWEEN $4 AND $5
						AND calculate_distance($8, $9, ip_location[0], ip_location[1], 'K') BETWEEN $10 and $11
						ORDER BY (CASE WHEN $6 = 'age' AND $7 = 'asc' THEN age END) ASC,
								(CASE WHEN $6 = 'age' AND $7 = 'desc' THEN age END) DESC,
								(CASE WHEN $6 = 'distance' AND $7 = 'asc'
									THEN calculate_distance($8, $9, ip_location[0], ip_location[1], 'K') END) ASC,
								(CASE WHEN $6 = 'distance' AND $7 = 'desc'
									THEN calculate_distance($8, $9, ip_location[0], ip_location[1], 'K') END) DESC,
								(CASE WHEN $6 = 'fame_rating' AND $7 = 'asc' THEN fame_rating END) ASC,
								(CASE WHEN $6 = 'fame_rating' AND $7 = 'desc' THEN fame_rating END) DESC, username`
				var { rows } = await pool.query(sql, variables)
				// console.log("Browsing Data: ", rows)
				// var length = rows.length
				console.log("Amount of results: ", rows.length)
				var selectedRows = rows.slice(body.offset, body.offset + body.amount)
				// selectedRows[0].push({total_results: rows.length})
				// var returnRows = {...selectedRows, total_results: length}
				console.log("Browsing Data To Show: ", selectedRows)
				response.send(selectedRows)
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
			const liked_person_id = request.params.id

			var sql = `INSERT INTO likes (liker_id, target_id) VALUES ($1, $2)`
			await pool.query(sql, [sess.userid, liked_person_id])

			var sql = `SELECT * FROM likes WHERE liker_id = $2 AND target_id = $1`
			const { rows } = await pool.query(sql, [sess.userid, liked_person_id])

			if (rows.length !== 0) {
				var sql = `INSERT INTO connections (user1_id, user2_id) VALUES ($1, $2)`
				await pool.query(sql, [sess.userid, liked_person_id])
			}

			response.status(200).send("Liked user!")
		}
	})

	app.post('/api/browsing/unlikeuser/:id', async (request, response) => {
		const sess = request.session

		if (sess.userid) {
			const liked_person_id = request.params.id

			var sql = `DELETE FROM likes WHERE liker_id = $1 AND target_id = $2`
			await pool.query(sql, [sess.userid, liked_person_id])

			var sql = `DELETE FROM connections
					WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)`
			const { rows } = await pool.query(sql, [sess.userid, liked_person_id])

			response.status(200).send("Unliked user!")
		}
	})

	app.get('/api/browsing/likedusers', async (request, response) => {
		const sess = request.session

		if (sess.userid) {
			var sql = `SELECT target_id FROM likes WHERE liker_id = $1`
			const { rows } = await pool.query(sql, [sess.userid])
			const likedUserIds = rows.map(user => user.target_id)
			console.log(likedUserIds)
			response.send(likedUserIds)
		}
	})

	app.get('/api/browsing/connectedusers', async (request, response) => {
		const sess = request.session

		if (sess.userid) {
			var sql = `SELECT user2_id FROM connections WHERE user1_id = $1`
			var results1 = await pool.query(sql, [sess.userid])

			var sql = `SELECT user1_id FROM connections WHERE user2_id = $1`
			var results2 = await pool.query(sql, [sess.userid])

			const results = results1.rows.concat(results2.rows)
			const connectedUserIds = results.map(result => {
				if (result.user1_id)
					return (result.user1_id)
				else if (result.user2_id)
					return (result.user2_id)
			})
			console.log(connectedUserIds)
			response.send(connectedUserIds)
		}
	})

}
