module.exports = (app, pool, session) => {

	app.get('/api/browsing', async (request, response) => {
		const sess = request.session

		try {
			var sql = `SELECT id, username, firstname, lastname, gender, age, sexual_pref,
						biography, fame_rating, user_location, picture_data AS profile_pic FROM users
						LEFT JOIN user_settings ON users.id = user_settings.user_id
						LEFT JOIN user_pictures ON users.id = user_pictures.user_id
						WHERE users.id != $1 AND user_pictures.profile_pic = 'YES'`
			var { rows } = await pool.query(sql, [sess.userid])
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
}
