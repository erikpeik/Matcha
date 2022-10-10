module.exports = function (app, pool, bcrypt, transporter) {

	app.post('/api/resetpassword', (request, response) => {
		const { resetvalue } = request.body

		const findUserAccount = async () => {
			var sql = "SELECT * FROM users WHERE username = $1 OR email = $1";
			const { rows } = await pool.query(sql, [resetvalue])
			if (rows.length === 0) {
				throw ("User not found!")
			} else {
				return (rows)
			}
		}

		const createResetCode = async (rows) => {
			let code = await Math.floor(Math.random() * (900000) + 100000)
			let hashedCode = await bcrypt.hash(toString(code), 10)
			let emailCode = hashedCode.replaceAll('/','-')

			try {
				var sql = `INSERT INTO password_reset (user_id, reset_code, expire_time)
							VALUES ($1,$2,(CURRENT_TIMESTAMP + interval '30 minutes')) RETURNING *`;
				await pool.query(sql, [rows[0]['id'], emailCode])
				const mailInfo = { username: rows[0]['username'], email: rows[0]['email'], code: emailCode }
				return (mailInfo)
			} catch (error) {
				throw (error)
			}
		}

		const sendResetMail = async (mailInfo) => {
			var mailOptions = {
				from: process.env.EMAIL_ADDRESS,
				to: mailInfo.email,
				subject: 'Matcha password reset',
				html: `<h1>Hello!</h1><p>It seems like you have forgotten your password!</p>
						<p>Never mind, who remembers those anyway. And it's very easy to reset
						with a single click!</p>
						<a href="http://localhost:3000/resetpassword/${mailInfo.username}/${mailInfo.code}">Just click here to create a new password!</a>
						<p>Love, Matcha Mail</p>`
			};

			await transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.log(error);
				} else {
					console.log('Email sent: ' + info.response);
				}
			});

			return
		}

		findUserAccount()
			.then(rows => createResetCode(rows))
			.then(mailInfo => sendResetMail(mailInfo))
			.then(() => response.send(true))
			.catch(error => response.send(error))
	});

	app.post('/api/setnewpassword', async (request, response) => {
		const { user, code, password, confirmPassword } = request.body

		if (password !== confirmPassword) {
			return response.send("The entered passwords are not the same!")
		}
		else if (!password.match(/(?=^.{8,30}$)(?=.*\d)(?=.*[!.@#$%^&*]+)(?=.*[A-Z])(?=.*[a-z]).*$/)) {
			return response.send("PLEASE ENTER A PASSWORD WITH: a length between 8 and 30 characters, at least one lowercase character (a-z), at least one uppercase character (A-Z), at least one numeric character (0-9) and at least one special character (!.@#$%^&*)")
		}
		else {
			var sql = `SELECT * FROM password_reset
						INNER JOIN users ON password_reset.user_id = users.id
						WHERE users.username = $1 AND password_reset.reset_code = $2`
			const { rows } = await pool.query(sql, [user, code])
			if (rows.length === 0) {
				response.send("Password reset code not found!")
			} else {
				const hash = await bcrypt.hash(password, 10);
				var sql = "UPDATE users SET password = $1 WHERE username = $2"
				await pool.query(sql, [hash, user])
				var sql = "DELETE FROM password_reset WHERE user_id = $1"
				await pool.query(sql, [rows[0]['id']])
				response.send(true)
			}
		}
	})

}