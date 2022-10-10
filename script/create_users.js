const { faker } = require('@faker-js/faker')
const { Pool } = require('pg')

 

Array.prototype.random = function () {
	return this[Math.floor((Math.random() * this.length))];
}

const users = []
const gender_list = ["men", "female", "other"]

const initUsers = async () => {
	console.log("User creating started")
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


	for (let i = 0; i < 500; i++) {
		// console.log("Creating user " + i)
		let gender = gender_list.random()
		let firstname, lastname
		if (gender === "man") {
			firstname = faker.name.firstName('male')
			lastname = faker.name.lastName('male')
		} else if (gender === "female") {
			firstname = faker.name.firstName('female')
			lastname = faker.name.firstName("female")
		} else {
			firstname = faker.name.firstName()
			lastname = faker.name.lastName()
		}
		let username = faker.internet.userName(firstname, lastname)
		let email = faker.internet.email(firstname, lastname)
		users.push({
			username,
			firstname,
			lastname,
			email,
			password: "$2b$10$7yu6NkhTEk/uCAsXjlAS2OqpDQ2mSP0WQCNtKK97hCDDC12xB/PPa",
			verified: "YES"
		})
	}

	// console.log(users)
}


initUsers()
    .then(() => {
        console.log("User creating finished")
    })