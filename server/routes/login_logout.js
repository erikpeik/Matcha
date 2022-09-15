module.exports = function (app, pool, bcrypt) {

	app.post('/api/login', (request, response) => {
		const { username, password } = request.body

		const verifyUser = async () => {
			var sql = "SELECT * FROM users WHERE username = $1 AND verified = 'YES'";
			const { rows } = await pool.query(sql, [username])
			if (rows.length === 0) {
				console.log("User not found!")
				throw ("User not found!")
			} else {
				const compareResult = await bcrypt.compare(password, rows[0]['password'])
				if (compareResult) {
					sess = request.session
					sess.userid = rows[0]['id']
					sess.username = rows[0]['username']
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
		sess = request.session;
		if (sess.username) {
			response.send(sess.username);
		}
		else {
			response.send('');
		}
	});

	app.get('/api/logout', (request, response) => {
		request.session.destroy((err) => {
			if (err) {
				return console.log(err);
			}
			// console.log(sess)
			response.end();
		});

	});

}