module.exports = (app, pool, session) => {

	app.post('/api/profile/setup', async (request, response) => {
		const { gender, age, location, sexual_pref, biography } = request.body
		var sess = request.session

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

}
