module.exports = (app, pool, session) => {
	app.post('/api/profile/setup', async (request, response) => {
		var sess = request.session
		const { gender, age, location, sexual_pref, biography } = request.body

		// MUST CREATE CHECKS FOR ALL THE VARIABLES FIRST

		try {
			var sql = `INSERT INTO user_settings (user_id, gender, age, user_location, sexual_pref, biography)
					VALUES ($1,$2,$3,$4,$5, $6)`
			await pool.query(sql, [sess.userid, gender, age, location, sexual_pref, biography])
			response.send(true)
		} catch (error) {
			response.send(error)
		}
	})

	app.get('/api/profile', async (request, response) => {
		const sess = request.session

		try {
			var sql = `SELECT * FROM users
						INNER JOIN user_settings ON users.id = user_settings.user_id
						WHERE users.id = $1`
			var { rows } = await pool.query(sql, [sess.userid])
			// console.log("Profile Data: ", rows[0])
			const { password: removed_password, ...profileData } = rows[0]
			// console.log("Profile Data: ", profileData)

			var sql = `SELECT * FROM user_pictures WHERE user_id = $1 AND profile_pic = 'YES'`
			var profile_pic = await pool.query(sql, [sess.userid])

			if (profile_pic.rows[0]) {
				profileData.profile_pic = profile_pic.rows[0]
			}
			// console.log(profile_pic.rows[0]['picture_data'])

			var sql = `SELECT * FROM user_pictures WHERE user_id = $1 AND profile_pic = 'NO'`
			var other_pictures = await pool.query(sql, [sess.userid])
			// console.log(other_pictures.rows)
			if (other_pictures.rows) {
				profileData.other_pictures = other_pictures.rows
			}
			response.send(profileData)
		} catch (error) {
			response.send(error)
		}
	})

}
