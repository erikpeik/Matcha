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
			const { rows } = await pool.query(sql, [sess.userid])
			// console.log("Profile Data: ", rows)
			response.send( rows[0] )
		} catch (error) {
			response.send(error)
		}
	})

}
