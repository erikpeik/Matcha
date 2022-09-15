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

morgan.token('body', request => {
	return JSON.stringify(request.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const { Pool } = require('pg')
const pool = new Pool({
	user: 'matcha',
	host: 'postgres-db',
	database: 'matcha',
	password: 'root',
	port: 5432,
})
pool.connect()

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_ADDRESS,
		pass: process.env.EMAIL_PASSWORD
	}
});

var sess;

require('./routes/signup.js')(app, pool, bcrypt, transporter);

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

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
