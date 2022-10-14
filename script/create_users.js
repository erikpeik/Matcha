const { faker } = require('@faker-js/faker')
const { Pool } = require('pg')
const axios = require('axios')
const fs = require('fs')
require('dotenv').config();

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
const tags = []
const tag_names = ["work", "dog", "music", "travel", "outdoors", "books",
	"adventure", "food", "hiking", "sports", "gaming", "movies", "tv", "art",
	"nature", "animals", "cars", "tech", "fashion", "beauty", "fitness",
	"health", "science", "history", "politics", "religion", "philosophy",
	"psychology", "education", "family", "friends", "cats"]

const pool = new Pool({
	user: 'matcha',
	host: 'localhost',
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
			initTags()
			initUsers()
				.then(() => {
					console.log("User creating finished, you can close this window")
				})
		}
	})
}
connectToDatabase()

const initTags = async () => {
	for (let i = 0; i < tag_names.length; i++) {
		let sql = `SELECT * FROM tags WHERE tag_content = LOWER($1)`
		let values = [tag_names[i]]
		let res = await pool.query(sql, values)
		if (res.rows.length === 0) {
			sql = `INSERT INTO tags (tag_content) VALUES (LOWER($1))`
			values = [tag_names[i]]
			await pool.query(sql, values)
		}
		let tag = {
			tag_content: tag_names[i],
			tagged_user: []
		}
		tags.push(tag)
	}
}

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
		password: "$2b$10$7yu6NkhTEk/uCAsXjlAS2OqpDQ2mSP0WQCNtKK97hCDDC12xB/PPa", // password: Matcha1!
		verified: "YES"
	}
	users.push(user)
	let sql = `INSERT INTO users (username, firstname, lastname, email, password, verified) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`
	let values = [user.username, user.firstname, user.lastname, user.email, user.password, user.verified]
	let res = await pool.query(sql, values)
	return (res.rows[0].id)
}

const createUserSettings = async (id, gender) => {
	let age = getRandomInt(18, 120)
	let sexual_pref = ["bisexual", "male", "female"].random()
	let biography = faker.lorem.paragraph()
	let coordinates = faker.address.nearbyGPSCoordinate([60.180929, 24.957521], 5000, true)
	let city_data = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates[0]},${coordinates[1]}&key=${process.env.GOOGLE_API}`)
	let user_location
	let length = city_data.data.results.length
	if (city_data.data.results.length > 0)
		user_location = city_data.data.results[length - 1].formatted_address
	else
		user_location = "Unknown"
	console.log('user_location', user_location)
	let ip_location = `(${coordinates[0]}, ${coordinates[1]})`
	let sql = `INSERT INTO user_settings (user_id, gender, age, sexual_pref, biography, user_location, ip_location) VALUES ($1,$2,$3,$4,$5,$6,$7)`
	let values = [id, gender, age, sexual_pref, biography, user_location, ip_location]
	await pool.query(sql, values)
}

const createFameRating = async (id, tag_count) => {
	let sql = `INSERT INTO fame_rates (user_id, setup_pts, picture_pts, tag_pts, like_pts, connection_pts, total_pts)
		VALUES ($1,$2,$3,$4,$5,$6,$7)`
	let values = [id, 5, 2, tag_count, 0, 0, 7 + tag_count]
	await pool.query(sql, values)
}

const createTags = async (id) => {
	let tag_count = getRandomInt(1, 5)
	let user_tags = []
	for (let i = 0; i < tag_count; i++) {
		let tag = tags.random()
		while (user_tags.includes(tag)) {
			tag = tags.random()
		}
		user_tags.push(tag)
		tag.tagged_user.push(id)
	}
	for (let i = 0; i < tags.length; i++) {
		for (let j = 0; j < tags[i].tagged_user.length; j++) {
			let sql = `UPDATE tags SET tagged_users = array_append(tagged_users, $1)
			WHERE LOWER(tag_content) = LOWER($2) AND (tagged_users @> array[$1]::INT[]) IS NOT TRUE`
			let values = [tags[i].tagged_user[j], tags[i].tag_content]
			await pool.query(sql, values)
		}
	}
	return tag_count
}

const getImageUrl = async (picture) => {
	const image = await axios.get(picture)
	const image_url = image.request.res.responseUrl
	return (image_url)
}

const downloadImage = async (url) => {
	const image = await axios.get(url)
	const contentType = image.headers['content-type']
	let path
	console.log('contentType', contentType)
	if (contentType === 'image/jpeg' || contentType === 'image/png') {
		const type = contentType.split('/')[1]
		path = `../server/images/file-` + Date.now() + `.${type}`
		try {
			axios({
				url,
				responseType: 'stream'
			})
				.then(async (response) => {
					setTimeout(async () => {
						new Promise(async (resolve, reject) => {
							response.data
								.pipe(fs.createWriteStream(path))
								.on('finish', () => resolve())
								.on('error', e => reject(e))
						})
					}, 300)
				})
				.catch(err => console.log(err))
		} catch (err) {
			console.log(`API call failed: ${err.code}`)
		}
	}
	return (path)
}

const createPicture = async (id) => {
	let picture = faker.image.cats(640, 640, true)
	let image_url = await getImageUrl(picture)
	const image_path = await downloadImage(image_url)
	let sql = `INSERT INTO user_pictures (user_id, picture_data, profile_pic) VALUES ($1,$2,'YES')`
	let values = [id, image_path]
	await pool.query(sql, values)
}

const initUsers = async () => {
	console.log("User creating started")

	for (let i = 0; i < 500; i++) {
		console.log("Creating user " + i)
		let gender = gender_list.random()
		let id = await createUser(gender)
		await createUserSettings(id, gender)
		let tag_count = await createTags(id)
		await createFameRating(id, tag_count)
		await createPicture(id)
	}
}
