require('dotenv').config() // to use .env variables
const express = require('express')
const app = express()
app.use(express.json()) // needed to attach JSON data to POST body property
// app.use(express.urlencoded()) // needed to attach urlencoded data to POST body property (deprecated)
var morgan = require('morgan') // middleware to log requests
var nodemailer = require('nodemailer'); // middleware to send e-mails
const cors = require('cors') // Cross-origin resource sharing (CORS) middleware is required to allow requests from other origins
const bcrypt = require("bcrypt") // For password hashing and comparing
const session = require('express-session'); // for session management
const multer = require('multer') // for image upload and storage
const fs = require('fs'); // for base64 conversion of images
const path = require('path')
app.use(cors())
app.use(express.static('build')) // express checks if the 'build' directory contains the requested file
app.use('/images', express.static('./images')) // to serve static files to path /images, from images folder
app.use(session({ secret: 'matchac2r2p6', saveUninitialized: true, resave: true }));
const http = require('http').Server(app)

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

const connectToDatabase = () => {
	pool.connect((err, client, release) => {
		if (err) {
			console.log('Error acquiring client', err.stack)
			console.log('Retrying in 5 seconds...')
			setTimeout(connectToDatabase, 5000)
		} else {
			console.log('Connected to database')
		}
	})
}
connectToDatabase()

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_ADDRESS,
		pass: process.env.EMAIL_PASSWORD
	}
});

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'images/')
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
	},
})
// const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

require('./routes/signup.js')(app, pool, bcrypt, transporter);
require('./routes/login_logout.js')(app, pool, session, bcrypt)
require('./routes/resetpassword.js')(app, pool, bcrypt, transporter)
require('./routes/profile.js')(app, pool, session, upload, fs, path, bcrypt)
require('./routes/browsing.js')(app, pool, transporter, session)
require('./routes/chat.js')(http, pool)
require('./routes/chat_api.js')(app, pool, session)

const PORT = process.env.PORT || 3001

http.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`)
})
