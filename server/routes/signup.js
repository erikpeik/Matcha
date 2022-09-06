module.exports = function (app, con, bcrypt) {
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

		async function saveHashedUser() {
			const hash = await bcrypt.hash(body.password, 10);
			console.log("Hashed password: " + hash)
			var sql = "INSERT INTO users (username, firstname, lastname, email, password) VALUES (?,?,?,?,?)";
			con.query(sql, [body.username, body.firstname, body.lastname, body.email, hash], function (err, result) {
				if (err) throw err;
				console.log("New user created!");
				response.json("New user created! " + JSON.stringify(result))
			})
		}

		saveHashedUser()
	})
}
