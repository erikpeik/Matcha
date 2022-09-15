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
require('./routes/login_logout.js')(app, pool, bcrypt)
require('./routes/resetpassword.js')(app, pool, bcrypt, transporter)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
