const { faker } = require('@faker-js/faker')
const { Pool } = require('pg')
const axios = require('axios')

Array.prototype.random = function () {
	return this[Math.floor((Math.random() * this.length))];
}

function getRandomInt(min, max) {
	min = Math.ceil(min)
	max = Math.floor(max)
	return Math.floor(Math.random() * (max - min) + min)
}

const users = []
const gender_list = ["male", "female", "other"]

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
			initUsers()
				.then(() => {
					console.log("User creating finished, you can close this window")
				})
		}
	})
}
connectToDatabase()

const createUser = async (gender) => {
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
	let user = {
		username,
		firstname,
		lastname,
		email,
		password: "$2b$10$7yu6NkhTEk/uCAsXjlAS2OqpDQ2mSP0WQCNtKK97hCDDC12xB/PPa",
		verified: "YES"
	}
	users.push(user)
	let sql = `INSERT INTO users (username, firstname, lastname, email, password, verified) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`
	let values = [user.username, user.firstname, user.lastname, user.email, user.password, user.verified]
	let res = await pool.query(sql, values)
	// console.log(res.rows[0])
	return (res.rows[0].id)
}

const createUserSettings = async (id, gender) => {
	let age = getRandomInt(18, 120)
	let sexual_pref = ["bisexual", "male", "female"].random()
	let biography = faker.lorem.paragraph()
	let coordinates = faker.address.nearbyGPSCoordinate([60.180929, 24.957521], 5000, true)
	let city_data = await axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coordinates[0]}&longitude=${coordinates[1]}&localityLanguage=en`)
	let city = city_data.data.city
	let country = city_data.data.countryName
	let user_location

	if ((city !== '' && city !== undefined) && (country !== '' && country !== undefined)) {
		user_location = `${city}, ${country}`
	} else if ((city === '' || city === undefined) && (country !== '' && country !== undefined)) {
		user_location = country
	} else if (city_data.data.locality !== '' && city_data.data.locality !== undefined) {
		user_location = city_data.data.locality
	} else {
		user_location = "Unknown"
	}
	//	console.log(`${city}, ${country} = ${user_location}`)

	let ip_location = `(${coordinates[0]}, ${coordinates[1]})`
	let sql = `INSERT INTO user_settings (user_id, gender, age, sexual_pref, biography, user_location, ip_location) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`
	let values = [id, gender, age, sexual_pref, biography, user_location, ip_location]
	let res = await pool.query(sql, values)
	//	console.log(res.rows[0])
	return (res.rows[0])
}

const initUsers = async () => {
	console.log("User creating started")

	for (let i = 0; i < 500; i++) {
		console.log("Creating user " + i)
		let gender = gender_list.random()
		let id = await createUser(gender)
		await createUserSettings(id, gender)
	}
}
