module.exports = (app, pool, session) => {

	app.get('/api/browsing', async (request, response) => {
		const sess = request.session

		try {
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
		} catch (error) {
			response.send(error)
		}
	})

	app.post('/api/browsing/sorted', async (request, response) => {
		const body = request.body
		const sess = request.session

		try {
			const variables = [sess.userid, body.min_age, body.max_age, body.min_fame, body.max_fame, body.sorting, body.sort_order, body.amount,
			sess.location[0], sess.location[1], body.min_distance, body.max_distance]
			console.log("Variables: ", body, sess.location[0], sess.location[1])
			var sql = `SELECT id, username, firstname, lastname, gender, age, sexual_pref,
						biography, fame_rating, user_location, picture_data AS profile_pic,
						calculate_distance($9, $10, ip_location[0], ip_location[1], 'K') AS distance
						FROM users
						LEFT JOIN user_settings ON users.id = user_settings.user_id
						LEFT JOIN user_pictures ON users.id = user_pictures.user_id
						WHERE users.id != $1
						AND age BETWEEN $2 and $3 AND fame_rating BETWEEN $4 AND $5
						AND calculate_distance($9, $10, ip_location[0], ip_location[1], 'K') BETWEEN $11 and $12
						ORDER BY (CASE WHEN $6 = 'age' AND $7 = 'asc' THEN age END) ASC,
								(CASE WHEN $6 = 'age' AND $7 = 'desc' THEN age END) DESC,
								(CASE WHEN $6 = 'user_location' AND $7 = 'asc' THEN user_location END) ASC,
								(CASE WHEN $6 = 'user_location' AND $7 = 'desc' THEN user_location END) DESC
						LIMIT $8`
			var { rows } = await pool.query(sql, variables)
			// console.log("Browsing Data: ", rows)
			console.log("Browsing Data To Show: ", rows)
			response.send(rows)
		} catch (error) {
			response.send(error)
		}
	})
}
