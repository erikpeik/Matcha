module.exports = (app, pool, session, upload, fs, path) => {
	app.post('/api/profile/setup', async (request, response) => {
		var sess = request.session
		const { gender, age, city, gps, sexual_pref, biography } = request.body

		// MUST CREATE CHECKS FOR ALL THE VARIABLES FIRST

		try {
			var sql = `INSERT INTO user_settings (user_id, gender, age, user_location, sexual_pref, biography)
					VALUES ($1,$2,$3,$4,$5, $6)`
			await pool.query(sql, [sess.userid, gender, age, location, sexual_pref, biography])

			var sql = "INSERT INTO user_settings (user_id, user_location, ip_location) VALUES ($1,$2,point($3,$4)) RETURNING *";
			await pool.query(sql, [rows[0]['id'], city, gps[0], gps[1]])

			response.send(true)
		} catch (error) {
			response.send(error)
		}
	})

	app.post('/api/profile/editsettings', async (request, response) => {
		var sess = request.session
		const { username, firstname, lastname, email, gender, age,
			location, gps_lat, gps_lon, sexual_pref, biography, tags } = request.body

		// MUST CREATE CHECKS FOR ALL THE VARIABLES FIRST
		if (sess.userid) {
			try {
				var sql = `UPDATE users SET username = $1, firstname = $2, lastname = $3, email = $4
						WHERE id = $5`
				await pool.query(sql, [username, firstname, lastname, email, sess.userid])

				var sql = `UPDATE user_settings
						SET gender = $1, age = $2, user_location = $3, sexual_pref = $4,
						biography = $5, ip_location = point($6,$7) WHERE user_id = $8`
				await pool.query(sql, [gender, age, location, sexual_pref, biography, gps_lat, gps_lon, sess.userid])

				var sql = `UPDATE tags SET tagged_users = array_remove(tagged_users, $1)
							WHERE (array[LOWER($2)] @> array[LOWER(tag_content)]::TEXT[]) IS NOT TRUE`
				await pool.query(sql, [sess.userid, tags])

				tags.map(async (tagtext) => {
					var sql = "SELECT * FROM tags WHERE LOWER(tag_content) = LOWER($1)"
					var { rows } = await pool.query(sql, [tagtext])

					if (rows.length === 0) {
						var sql = `INSERT INTO tags (tag_content, tagged_users) VALUES (LOWER($2), array[$1]::INT[])`
						await pool.query(sql, [sess.userid, tagtext])
					} else {
						var sql = `UPDATE tags SET tagged_users = array_append(tagged_users, $1)
								WHERE LOWER(tag_content) = LOWER($2) AND (tagged_users @> array[$1]::INT[]) IS NOT TRUE`
						await pool.query(sql, [sess.userid, tagtext])
					}
				})
				// console.log(tagtext)
				response.send(true)
			} catch (error) {
				console.log(error)
				response.send(error)
			}
		}
	})

	app.get('/api/profile', async (request, response) => {
		const sess = request.session

		try {
			var sql = `SELECT * FROM users
						INNER JOIN user_settings ON users.id = user_settings.user_id
						WHERE users.id = $1`
			var { rows } = await pool.query(sql, [sess.userid])
			// console.log("Profile Data: ", rows[0])
			const { password: removed_password, ...profileData } = rows[0]
			// console.log("Profile Data: ", profileData)

			var sql = `SELECT * FROM tags WHERE tagged_users @> array[$1]::INT[]
						ORDER BY tag_id`
			var tags = await pool.query(sql, [sess.userid])

			profileData.tags = tags.rows.map(tag => tag.tag_content)

			var sql = `SELECT * FROM user_pictures WHERE user_id = $1 AND profile_pic = 'YES'`
			var profile_pic = await pool.query(sql, [sess.userid])

			if (profile_pic.rows[0]) {
				profileData.profile_pic = profile_pic.rows[0]
			} else {
				profileData.profile_pic = { user_id: sess.userid, picture_data: 'http://localhost:3000/images/default_profilepic.jpeg' }
			}
			// console.log(profile_pic.rows[0]['picture_data'])

			var sql = `SELECT * FROM user_pictures WHERE user_id = $1 AND profile_pic = 'NO' ORDER BY picture_id`
			var other_pictures = await pool.query(sql, [sess.userid])
			// console.log(other_pictures.rows)
			if (other_pictures.rows) {
				profileData.other_pictures = other_pictures.rows
			}
			response.send(profileData)
		} catch (error) {
			response.send(false)
		}
	})

	app.post('/api/profile/setprofilepic', upload.single('file'), async (request, response) => {
		const sess = request.session
		const image = 'http://localhost:3000/images/' + request.file.filename

		var sql = `SELECT * FROM user_pictures
					WHERE user_id = $1 AND profile_pic = 'YES'`
		var { rows } = await pool.query(sql, [sess.userid])

		if (rows.length === 0) {
			var sql = `INSERT INTO user_pictures (user_id, picture_data, profile_pic) VALUES ($1, $2, 'YES')`
			await pool.query(sql, [sess.userid, image])
		} else {
			var oldImageData = rows[0]['picture_data']
			if (oldImageData !== 'http://localhost:3000/images/default_profilepic.jpeg') {
				const oldImage = path.resolve(__dirname, '../images') + oldImageData.replace('http://localhost:3000/images', '');
				console.log(oldImage)
				if (fs.existsSync(oldImage)) {
					fs.unlink(oldImage, (err) => {
						if (err) {
							console.error(err);
							return;
						}
					})
				}
			}
			var sql = `UPDATE user_pictures SET picture_data = $1
						WHERE user_id = $2 AND profile_pic = 'YES'`
			await pool.query(sql, [image, sess.userid])
		}
		response.send("Success uploading!")
	})

	app.post('/api/profile/imageupload', upload.single('file'), async (request, response) => {
		const sess = request.session
		const image = 'http://localhost:3000/images/' + request.file.filename

		if (sess.userid) {
			try {
				var sql = `SELECT * FROM user_pictures WHERE user_id = $1`
				var { rows } = await pool.query(sql, [sess.userid])

				if (rows.length < 5) {
					var sql = `INSERT INTO user_pictures (user_id, picture_data, profile_pic) VALUES ($1, $2, 'NO')`
					await pool.query(sql, [sess.userid, image])
					response.send(true)
				} else {
					response.send("You have uploaded too many pictures. Delete some to make room for new ones!")
				}
			} catch (error) {
				console.log(error)
			}
		}
	})

	// BASE64 VERSION

	// app.post('/api/profile/imageupload', upload.single('file'), async function (request, response) {
	// 	const sess = request.session
	// 	const encoded = request.file.buffer.toString('base64')
	// 	console.log(encoded)

	// 	var sql = `SELECT * FROM user_pictures
	// 				INNER JOIN users ON users.id = user_pictures.user_id
	// 				WHERE users.id = $1 AND user_pictures.profile_pic = 'YES'`
	// 	var { rows } = await pool.query(sql, [sess.userid])

	// 	if (rows.length === 0) {
	// 		var sql = `INSERT INTO user_pictures (user_id, picture_data, profile_pic) VALUES ($1, $2, 'YES')`
	// 		await pool.query(sql, [sess.userid, encoded])
	// 	} else {
	// 		var sql = `UPDATE user_pictures SET picture_data = $1
	// 					WHERE user_id = $2 AND profile_pic = 'YES'`
	// 		await pool.query(sql, [encoded, sess.userid])
	// 	}
	// 	response.send("Success uploading!")
	// });

	app.delete('/api/profile/deletepicture/:id', async (request, response) => {
		const sess = request.session

		if (sess.userid) {
			const picture_id = request.params.id

			var sql = `SELECT * FROM user_pictures WHERE user_id = $1 AND picture_id = $2`
			var { rows } = await pool.query(sql, [sess.userid, picture_id])

			var oldImageData = rows[0]['picture_data']
			if (oldImageData !== 'http://localhost:3000/images/default_profilepic.jpeg') {
				const oldImage = path.resolve(__dirname, '../images') + oldImageData.replace('http://localhost:3000/images', '');
				console.log(oldImage)
				if (fs.existsSync(oldImage)) {
					fs.unlink(oldImage, (err) => {
						if (err) {
							console.error(err);
							return;
						}
					})
				}
			}
			var sql = "DELETE FROM user_pictures WHERE user_id = $1 AND picture_id = $2"
			await pool.query(sql, [sess.userid, picture_id])
			response.status(200).send("Picture deleted")
		}
	})

	app.get('/api/profile/notifications', async (request, response) => {
		const sess = request.session

		if (sess.userid) {
			var sql = `SELECT * FROM notifications WHERE user_id = $1 AND read = 'NO'`
			const {rows} = await pool.query(sql, [sess.userid])

			response.send(rows)
		}
	})
}
