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
			var sql = "SELECT * FROM users WHERE username = ?";
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
			var sql = "SELECT * FROM users WHERE email = ?";
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

		Promise.all([checkUsername, checkEmail])
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

		var sql = `CREATE TABLE IF NOT EXISTS users (
		id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		username VARCHAR(255) NOT NULL,
		firstname VARCHAR(255) NOT NULL,
		lastname VARCHAR(255) NOT NULL,
		email VARCHAR(255) NOT NULL,
		password VARCHAR(255) NOT NULL,
		verified ENUM('YES','NO') DEFAULT 'NO',
		online ENUM('YES','NO') DEFAULT 'NO',
		last_connection TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`;
		con.query(sql);

		async function saveHashedUser(callback) {
			const hash = await bcrypt.hash(body.password, 10);
			console.log("Hashed password: " + hash)
			var sql = "INSERT INTO users (username, firstname, lastname, email, password) VALUES (?,?,?,?,?)";
			var result = await con.query(sql, [body.username, body.firstname, body.lastname, body.email, hash])
			// console.log("SQL query result: ", result)
			return result
		}

		async function createVerifyCode() {
			var sql = `CREATE TABLE IF NOT EXISTS email_verify (
				running_id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
				user_id INT(11) NOT NULL,
				email VARCHAR(255) NOT NULL,
				verify_code INT(11) NOT NULL,
				expire_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
				)`;
			// ONLY CURRENT TIMESTAMP ON EXPIRE_TIME!!!
			await con.query(sql);

			const getUserId = new Promise((resolve, reject) => {
				var sql = "SELECT id FROM users WHERE username = ?";
				con.query(sql, [body.username], function (err, result) {
					if (err) throw err;
					if (!result.length) {
						reject("No code found!")
					} else {
						console.log("Id SQL result: " + result[0]['id']);
						resolve(result[0]['id'])
					}
				})
			})

			var code = await Math.floor(Math.random() * (900000) + 100000)

			getUserId
				.then(user_id => {
					var sql = "INSERT INTO email_verify (user_id, email, verify_code) VALUES (?,?,?)";
					con.query(sql, [user_id, body.email, code], function (err, result) {
						if (err) throw err;
						console.log("Email verify created!");
					})
				}).catch(error => {
					console.log(error)
				})

			return (code)
		}

		function sendConfirmationMail(useremail, code) {
			var transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					user: process.env.MAIL_ADDRESS,
					pass: process.env.MAIL_PASSWORD
				}
			});

			var mailOptions = {
				from: process.env.MAIL_ADDRESS,
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

		// async function verifyUser() {
		// 	const user_created = await saveHashedUser((result) => {
		// 		console.log("Result from saveHashedUser 1: " + result)
		// 		return result
		// 	})
		// 	console.log("Result from saveHashedUser 2: " + user_created)
		// 	const code = await createVerifyCode()
		// 	const mail = sendConfirmationMail(body.email, code)
		// 	response.json("New user created!" + user_created)
		// }

		function verifyUser() {
			saveHashedUser().then((res) => {
				const code = createVerifyCode()
				const mail = sendConfirmationMail(body.email, code)
				console.log("Result from saveHashedUser 2: ", res)
				response.json("New user created!" + res)
			})
		}

		verifyUser()

	})
}
