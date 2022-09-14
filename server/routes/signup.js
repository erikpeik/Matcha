module.exports = function (app, con, bcrypt, nodemailer) {
	app.post('/api/signup/checkuser', (request, response) => {
		const body = request.body

		console.log("Username: " + body.username)
		if (body.username.length < 4 || body.username.length > 25)
			return response.send("Username has to be between 4 and 25 characters.")
		if (!body.username.match(/^[a-z0-9]+$/i))
			return response.send("Username should only include characters (a-z or A-Z) and numbers (0-9).")
		if (!body.firstname.match(/^[a-zåäö]+$/i) || !body.lastname.match(/^[a-zåäö]+$/i))
			return response.send("First name and last name can only include characters a-z and å, ä, ö.")
		if (!body.email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/))
			return response.send("Please enter a valid e-mail address.")
		if (!body.password.match(/(?=^.{8,30}$)(?=.*\d)(?=.*[!.@#$%^&*]+)(?=.*[A-Z])(?=.*[a-z]).*$/)) {
			return response.send("PLEASE ENTER A PASSWORD WITH: </p><p> - a length between 8 and 30 characters </p><p> - at least one lowercase character (a-z) </p><p> - at least one uppercase character (A-Z) </p><p> - at least one numeric character (0-9) <br> at least one special character (!.@#$%^&*)")
		}
		if (body.password !== body.confirmPassword)
			return response.send("The entered passwords are not the same!")

		const checkUsername = async () => {
			var sql = "SELECT * FROM users WHERE username = $1";
			const result = await con.query(sql, [body.username])
			if (result.rows.length) {
				throw ("Username already exists!")
			} else
				return
		}

		const checkEmail = async () => {
			var sql = "SELECT * FROM users WHERE email = $1";
			const result = await con.query(sql, [body.email])
			if (result.rows.length) {
				throw ("User with this e-mail already exists!")
			} else
				return
		}

		checkUsername()
			.then(() => checkEmail())
			.then(() => {
				console.log("User details checked!")
				response.send(true)
			}).catch((error) => {
				response.send(error)
			})
	})

	app.post('/api/signup', (request, response) => {
		const body = request.body
		console.log("Signup username: " + body.username)

		const saveHashedUser = async () => {
			const hash = await bcrypt.hash(body.password, 10);
			console.log("Hashed password: " + hash)
			try {
				var sql = "INSERT INTO users (username, firstname, lastname, email, password) VALUES ($1,$2,$3,$4,$5) RETURNING *";
				const result = await con.query(sql, [body.username, body.firstname, body.lastname, body.email, hash])
				return
			} catch (error) {
				console.log("ERROR :", error)
				throw (error)
			}
		}

		const createVerifyCode = async () => {

			const getUserId = async () => {
				var sql = "SELECT id FROM users WHERE username = $1";
				const result = await con.query(sql, [body.username])
				console.log("Id SQL result: " + result.rows[0]['id']);
				return (result.rows[0]['id'])
			}

			var code = await Math.floor(Math.random() * (900000) + 100000)

			getUserId()
				.then(user_id => {
					var sql = "INSERT INTO email_verify (user_id, email, verify_code) VALUES ($1,$2,$3)";
					con.query(sql, [user_id, body.email, code])
					console.log("Email verify created!");
				}).catch(error => {
					console.log(error)
				})

			return (code)
		}

		const sendConfirmationMail = (useremail, code) => {

			var transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					user: process.env.EMAIL_ADDRESS,
					pass: process.env.EMAIL_PASSWORD
				}
			});

			var mailOptions = {
				from: process.env.EMAIL_ADDRESS,
				to: useremail,
				subject: 'Matcha account confirmation',
				html: `<h1>Welcome</h1><p>You have just signed up for Matcha, well done!</p>
						<p>To fully access the world of Matcha and find the one that was meant for you,
						you just need to confirm your account with a single click. Yes, it's that easy!</p>
						<a href="http://localhost:3000/confirm/${body.username}/${code}">Click here to start finding perfect Matches!</a>
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

		saveHashedUser().then(() => createVerifyCode())
			.then((code) => sendConfirmationMail(body.email, code))
			.then(() => {
				response.send("New user created!")
			}).catch((error) => {
				response.send(error)
			})
	})

	app.post('/api/signup/verifyuser', (request, response) => {
		const body = request.body

		const checkCode = async () => {
			var sql = `SELECT * FROM email_verify
						INNER JOIN users ON email_verify.user_id = users.id
						WHERE email_verify.verify_code = $1`;
			const result = await con.query(sql, [body.code])
			console.log(result);
			if (result.rows.length === 0) {
				throw ("No code found!")
			} else {
				return ("Code matches!")
			}
		}

		const setAccountVerified = () => {
			var sql = `UPDATE users SET verified = 'YES' WHERE username = $1`;
			con.query(sql, [body.username])

			var sql = `DELETE FROM email_verify WHERE verify_code = $1`;
			con.query(sql, [body.code])
		}

		checkCode().then(() => {
			setAccountVerified()
			console.log("User code verified!")
			response.send(true)
		}).catch((error) => {
			response.send(error)
		})
	})
}
