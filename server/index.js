require('dotenv').config() // to use .env variables
const express = require('express')
const app = express()
app.use(express.json()) // needed to attach JSON data to POST body property
var morgan = require('morgan') // middleware to log requests
var nodemailer = require('nodemailer'); // middleware to send e-mails
const cors = require('cors') // Cross-origin resource sharing (CORS) middleware is required to allow requests from other origins
const bcrypt = require("bcrypt") // For password hashing and comparing
const session = require('express-session'); // for session management
app.use(cors())
app.use(express.static('build')) // express checks if the 'build' directory contains the requested file
app.use(session({ secret: 'matchac2r2p6', saveUninitialized: true, resave: true }));

const { Client } = require('pg')
const con = new Client({
	user: 'matcha',
	host: 'postgres-db',
	database: 'matcha',
	password: 'root',
	port: 5432,
})
con.connect()

morgan.token('body', request => {
	return JSON.stringify(request.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

var sess;

require('./routes/signup.js')(app, con, bcrypt, nodemailer);

app.post('/api/login', (request, response) => {
	const body = request.body

	const verifyUser = async () => {
		var sql = "SELECT * FROM users WHERE username = $1";
		const result = await con.query(sql, [body.username])
		if (result.rows.length === 0) {
			console.log("User not found!")
			throw ("User not found!")
		} else {
			// console.log(result);
			const compareResult = await bcrypt.compare(body.password, result.rows[0]['password'])
			if (compareResult) {
				sess = request.session
				sess.userid = result.rows[0]['id']
				sess.username = result.rows[0]['username']
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

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
