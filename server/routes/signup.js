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

		const checkUsername = new Promise((resolve, reject) => {
			var sql = "SELECT * FROM users WHERE username = $1";
			con.query(sql, [body.username], function (err, result) {
				if (err) throw err;
				console.log(result);
				if (result.length) {
					reject("Username already exists!")
				} else {
					resolve()
				}
			});
		})

		const checkEmail = new Promise((resolve, reject) => {
			var sql = "SELECT * FROM users WHERE email = $1";
			con.query(sql, [body.email], function (err, result) {
				if (err) throw err;
				console.log(result);
				if (result.length) {
					reject("User with this e-mail already exists!")
				} else {
					resolve()
				}
			})
		})

		checkUsername
			.then(() => checkEmail)
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

		const saveHashedUser = new Promise(async (resolve) => {
			const hash = await bcrypt.hash(body.password, 10);
			console.log("Hashed password: " + hash)
			var sql = "INSERT INTO users (username, firstname, lastname, email, password) VALUES ($1,$2,$3,$4,$5)";
			con.query(sql, [body.username, body.firstname, body.lastname, body.email, hash], function (err, result) {
				if (err) throw err;
				resolve(JSON.stringify(result))
				// console.log("SQL query result: ", result)
			})
		})

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
					con.query(sql, [user_id, body.email, code], function (err, result) {
						if (err) throw err;
						console.log("Email verify created!");
					})
				}).catch(error => {
					console.log(error)
				})

			return (code)
		}

		const sendConfirmationMail = (useremail, code) => {
			console.log("Mail address and password:", process.env)

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

		saveHashedUser
			.then((result) => {
				console.log("Result from saveHashedUser: ", result)
				return createVerifyCode()
			})
			.then((code) => sendConfirmationMail(body.email, code))
			.then(() => {
				response.send("New user created!")
			}).catch((error) => {
				response.send(error)
			})
	})

	app.post('/api/signup/verifyuser', (request, response) => {
		const body = request.body

		const checkCode = new Promise((resolve, reject) => {
			var sql = `SELECT * FROM email_verify
						INNER JOIN users ON email_verify.user_id = users.id
						WHERE email_verify.verify_code = $1`;
			con.query(sql, [body.code], function (err, result) {
				if (err) throw err;
				console.log(result);
				if (!result.length) {
					reject("No code found!")
				} else {
					resolve("Code matches!")
				}
			})
		})

		const setAccountVerified = () => {
			var sql = `UPDATE users SET verified = 'YES' WHERE username = $1`;
			con.query(sql, [body.username])

			var sql = `DELETE FROM email_verify WHERE verify_code = $1`;
			con.query(sql, [body.code])
		}

		checkCode.then(() => {
			setAccountVerified()
			console.log("User code verified!")
			response.send(true)
		}).catch((error) => {
			response.send(error)
		})
	})
}
