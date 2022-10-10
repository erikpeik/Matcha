module.exports = function (app, pool, bcrypt) {

	app.post('/api/login', (request, response) => {
		const { username, password } = request.body

		const verifyUser = async () => {
			var sql = `SELECT * FROM users
					LEFT JOIN user_settings ON users.id = user_settings.user_id
					WHERE username = $1 OR email = $1`;
			const { rows } = await pool.query(sql, [username])
			if (rows.length === 0) {
				throw ("User not found!")
			} else if (rows[0]['verified'] === 'NO') {
				throw ("User account not yeat activated! Please check your inbox for confirmation email.")
			} else {
				const compareResult = await bcrypt.compare(password, rows[0]['password'])
				if (compareResult) {
					var sess = request.session
					sess.userid = rows[0]['id']
					sess.username = rows[0]['username']
					sess.location = rows[0]['ip_location']
					return (sess)
				} else
					throw ("Wrong password!")
			}
		}

		verifyUser()
			.then((sess) => {
				response.send(sess)
			}).catch(error => {
				response.send(error)
			})

	})

	app.get('/api/login', (request, response) => {
		var sess = request.session
		if (sess.username && sess.userid)
			response.send({ name: sess.username, id: sess.userid })
		else
			response.send('')
	})

	app.get('/api/logout', (request, response) => {
		request.session.destroy((err) => {
			if (err) {
				return console.log(err)
			}
			response.end()
		});

	});

}
