const express = require('express')
const app = express()
app.use(express.json()) // needed to attach JSON data to POST body property
var morgan = require('morgan') // Middleware to log requests
const cors = require('cors') // Cross-origin resource sharing (CORS) middleware is required to allow requests from other origins
app.use(cors())
app.use(express.static('build')) // express checks if the 'build' directory contains the requested file

morgan.token('body', request => {
	return JSON.stringify(request.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

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

let persons = [
	{
		"id": 1,
		"name": "Arto Hellas",
		"number": "040-123456"
	},
	{
		"id": 2,
		"name": "Ada Lovelace",
		"number": "39-44-5323523"
	},
	{
		"id": 3,
		"name": "Dan Abramov",
		"number": "12-43-234345"
	},
	{
		"id": 4,
		"name": "Mary Poppendieck",
		"number": "39-23-6423122"
	}
]

app.get('/info', (request, response) => {
	const personCount = persons.length
	const date = new Date()
	response.send(`<p>Phonebook has info for ${personCount} people</p><p>${date}</p>`)
})

app.get('/api/persons', (request, response) => {
	response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	// console.log(id)
	const person = persons.find(person => {
		return person.id === id
	})
	// console.log(person)
	if (person) {
		response.json(person)
	} else {
		response.status(404).end() // end method responds to the request without sending any data
	}
})

app.delete('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	persons = persons.filter(person => person.id !== id)

	response.status(204).end()
})

app.post('/api/persons', (request, response) => {
	const body = request.body

	if (!body.name || !body.number) {
		return response.status(400).json({
			error: 'name or number missing'
		})
	}

	if (persons.find(person => person.name === body.name)) {
		return response.status(400).json({
			error: 'name must be unique'
		})
	}

	const person = {
		id: Math.floor(Math.random() * 999),
		name: body.name,
		number: body.number
	}

	var sql = "INSERT INTO sample (id, name) VALUES (?,?)";
	con.query(sql, [1, body.name], function (err, result) {
		if (err) throw err;
		console.log("Result: " + result);
	});

	persons = persons.concat(person)
	response.json(person)
})

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
			// console.log(result);
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
			// console.log(result);
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
	var sql = "INSERT INTO users (username, firstname, lastname, email, password) VALUES (?,?,?,?,?)";
	con.query(sql, [body.username, body.firstname, body.lastname, body.email, body.password], function (err, result) {
		if (err) throw err;
		console.log("New user created!");
		response.json(result)
	});
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
