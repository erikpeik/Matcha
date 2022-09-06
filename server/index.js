const express = require('express')
const app = express()
app.use(express.json()) // needed to attach JSON data to POST body property
var morgan = require('morgan') // Middleware to log requests
const cors = require('cors') // Cross-origin resource sharing (CORS) middleware is required to allow requests from other origins
const bcrypt = require("bcrypt") // For password hashing and comparing
const session = require('express-session'); // for session management
app.use(cors())
app.use(express.static('build')) // express checks if the 'build' directory contains the requested file
app.use(session({ secret: 'matchac2r2p6', saveUninitialized: true, resave: true }));

morgan.token('body', request => {
	return JSON.stringify(request.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

var sess;

var mysql = require('mysql');

var con = mysql.createConnection({
	host: "mysql-db",
	user: "matcha",
	password: "root",
	database: "matcha"
});

con.connect(function (err) {
	//   if (err) throw err;
	console.log("Connected!");
})

require('./routes/signup.js')(app, con, bcrypt);
require('./routes/phonebook.js')(app, con);

app.post('/api/login', (request, response) => {
	const body = request.body

	const verifyUser = new Promise((resolve, reject) => {
		var sql = "SELECT * FROM users WHERE username = ?";
		con.query(sql, [body.username], function (err, result) {
			if (err) throw err;
			if (!result.length) {
				reject("User not found!")
			} else {
				console.log(result);
				bcrypt.compare(body.password, result[0]['password'])
					.then((compareResult) => {
						// console.log(compareResult);
						if (compareResult) {
							sess = request.session
							sess.userid = result[0]['id']
							sess.username = result[0]['username']
							// console.log(sess)
							resolve("Correct password!")
						}
						else
							reject("Wrong password!")
					}).catch(err => {
						reject(err)
					})
			}
		})
	})

	verifyUser
		.then((result) => {
			response.send(true)
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
		response.send('Please login first');
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

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
