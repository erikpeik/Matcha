module.exports = (app, pool, upload, fs, path, bcrypt) => {
	app.post('/api/profile/setup', async (request, response) => {
		var sess = request.session
		const { gender, age, location, gps, sexual_pref, biography, tags } = request.body

		if (!sess.userid)
			return response.send("User not signed in!")
		if (gender !== 'male' && gender !== 'female' && gender !== 'other')
			return response.send("Forbidden gender!")
		if (isNaN(age) || age < 18 || age > 120)
			return response.send("Forbidden age!")
		if (location.length > 50)
			return response.send("Maximum length for location is 50 characters.")
		if (!location.match(/^[a-z, åäö-]+$/i))
			return response.send("Forbidden characters in location! Allowed characters are a-z, å, ä, ö, comma (,) and dash (-).")
		if (isNaN(gps[0]) || isNaN(gps[1]) || gps[0] < -90 || gps[0] > 90 || gps[1] < -180 || gps[1] > 180)
			return response.send("Forbidden coordinates! The range for latitude is -90 to 90, and for longitude -180 to 180.")
		if (sexual_pref !== 'male' && sexual_pref !== 'female' && sexual_pref !== 'bisexual')
			return response.send("Forbidden sexual preference!")
		if (biography.length > 500)
			return response.send("The maximum length for biography is 500 characters!")
		const forbiddenTags = tags.filter(tag => !tag.match(/(?=^.{1,20}$)[a-z åäö-]+$/i))
		if (forbiddenTags.length !== 0)
			return response.send("The allowed characters in tags are a-z, å, ä, ö and dash (-), and maximum length is 20 characters.")

		try {
			var sql = `INSERT INTO user_settings (user_id, gender, age,
						user_location, sexual_pref, biography, ip_location)
						VALUES ($1,$2,$3,$4,$5,$6,point($7,$8))`
			await pool.query(sql, [sess.userid, gender, age, location, sexual_pref, biography, gps[0], gps[1]])
			var sql = `UPDATE fame_rates SET setup_pts = setup_pts + 5, total_pts = total_pts + 5
						WHERE user_id = $1 AND setup_pts < 5 AND total_pts <= 95`
			pool.query(sql, [sess.userid])
			sess.location = { x: Number(gps[0]), y: Number(gps[1]) }
			var sql = `UPDATE tags SET tagged_users = array_remove(tagged_users, $1)
							WHERE (array[LOWER($2)] @> array[LOWER(tag_content)]::TEXT[]) IS NOT TRUE
							RETURNING *`
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
			var tagPoints = tags.length
			if (tagPoints > 5)
				tagPoints = 5
			var sql = `UPDATE fame_rates SET total_pts = total_pts - tag_pts + $2, tag_pts = $2
							WHERE user_id = $1`
			await pool.query(sql, [sess.userid, tagPoints])

			response.send(true)
		} catch (error) {
			response.send(error)
		}
	})

	app.post('/api/profile/editsettings', async (request, response) => {
		var sess = request.session
		const { username, firstname, lastname, email, gender, age,
			location, gps_lat, gps_lon, sexual_pref, biography, tags } = request.body

		if (!sess.userid)
			return response.send("User not signed in!")
		var sql = "SELECT * FROM users WHERE (username = $1 OR email = $2) AND id != $3";
		const { rows } = await pool.query(sql, [username, email, sess.userid])
		if (rows.length !== 0)
			return response.send("Username or email is already in use!")
		if (username.length < 4 || username.length > 25)
			return response.send("Username has to be between 4 and 25 characters.")
		if (!username.match(/^[a-z0-9]+$/i))
			return response.send("Username should only include characters (a-z or A-Z) and numbers (0-9).")
		if (firstname.length > 50 || lastname.length > 50)
			return response.send("Maximum length for firstname and lastname is 50 characters.")
		if (!firstname.match(/^[a-zåäö-]+$/i) || !lastname.match(/^[a-zåäö-]+$/i))
			return response.send("First name and last name can only include characters a-z, å, ä, ö and dash (-).")
		if (email.length > 254 || !email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/))
			return response.send("Please enter a valid e-mail address.")
		if (gender !== 'male' && gender !== 'female' && gender !== 'other')
			return response.send("Forbidden gender!")
		if (isNaN(age) || age < 18 || age > 120)
			return response.send("Forbidden age!")
		if (location.length > 50)
			return response.send("Maximum length for location is 50 characters.")
		if (!location.match(/^[a-z, åäö-]+$/i))
			return response.send("Forbidden characters in location! Allowed characters are a-z, å, ä, ö, comma (,) and dash (-).")
		if (isNaN(gps_lat) || isNaN(gps_lon) || gps_lat < -90 || gps_lat > 90 || gps_lon < -180 || gps_lon > 180)
			return response.send("Forbidden coordinates! The range for latitude is -90 to 90, and for longitude -180 to 180.")
		if (sexual_pref !== 'male' && sexual_pref !== 'female' && sexual_pref !== 'bisexual')
			return response.send("Forbidden sexual preference!")
		if (biography.length > 500)
			return response.send("The maximum length for biography is 500 characters!")
		const forbiddenTags = tags.filter(tag => !tag.match(/(?=^.{1,20}$)[a-z åäö-]+$/i))
		if (forbiddenTags.length !== 0)
			return response.send("The allowed characters in tags are a-z, å, ä, ö and dash (-), and maximum length is 20 characters.")

		try {
			let sql = `UPDATE users SET username = $1, firstname = $2, lastname = $3, email = $4
						WHERE id = $5`
			await pool.query(sql, [username, firstname, lastname, email, sess.userid])

			sql = `UPDATE user_settings
						SET gender = $1, age = $2, user_location = $3, sexual_pref = $4,
						biography = $5, ip_location = point($6,$7) WHERE user_id = $8`
			await pool.query(sql, [gender, age, location, sexual_pref, biography, gps_lat, gps_lon, sess.userid])

			sess.location = { x: Number(gps_lat), y: Number(gps_lon) }

			sql = `UPDATE tags SET tagged_users = array_remove(tagged_users, $1)
							WHERE (array[LOWER($2)] @> array[LOWER(tag_content)]::TEXT[]) IS NOT TRUE
							RETURNING *`
			await pool.query(sql, [sess.userid, tags])

			sql = `DELETE FROM tags WHERE cardinality(tagged_users) = 0`
			pool.query(sql)

			await tags.map(async (tagtext) => {
				sql = "SELECT * FROM tags WHERE LOWER(tag_content) = LOWER($1)"
				var { rows } = await pool.query(sql, [tagtext])

				if (rows.length === 0) {
					sql = `INSERT INTO tags (tag_content, tagged_users) VALUES (LOWER($2), array[$1]::INT[])`
					await pool.query(sql, [sess.userid, tagtext])
				} else {
					sql = `UPDATE tags SET tagged_users = array_append(tagged_users, $1)
								WHERE LOWER(tag_content) = LOWER($2) AND (tagged_users @> array[$1]::INT[]) IS NOT TRUE`
					await pool.query(sql, [sess.userid, tagtext])
				}
			})
			var tagPoints = tags.length
			if (tagPoints > 5)
				tagPoints = 5
			sql = `UPDATE fame_rates SET total_pts = total_pts - tag_pts + $2, tag_pts = $2
							WHERE user_id = $1`
			await pool.query(sql, [sess.userid, tagPoints])
			response.send(true)
		} catch (error) {
			console.log(error)
			response.send("User settings update failed for some reason")
		}
	})

	app.post('/api/profile/changepassword', async (request, response) => {
		const sess = request.session
		const { oldPassword, newPassword, confirmPassword } = request.body

		if (newPassword !== confirmPassword) {
			return response.send("The entered new passwords are not the same!")
		}
		else if (!newPassword.match(/(?=^.{8,30}$)(?=.*\d)(?=.*[!.@#$%^&*]+)(?=.*[A-Z])(?=.*[a-z]).*$/)) {
			return response.send("PLEASE ENTER A NEW PASSWORD WITH: a length between 8 and 30 characters, at least one lowercase character (a-z), at least one uppercase character (A-Z), at least one numeric character (0-9) and at least one special character (!.@#$%^&*)")
		}

		var sql = `SELECT * FROM users WHERE id = $1`;
		const { rows } = await pool.query(sql, [sess.userid])

		if (!(await bcrypt.compare(oldPassword, rows[0]['password']))) {
			return response.send("The old password is not correct!")
		} else {
			const hash = await bcrypt.hash(newPassword, 10);
			try {
				var sql = "UPDATE users SET password = $1 WHERE id = $2";
				await pool.query(sql, [hash, sess.userid])
				return response.send(true)
			} catch (error) {
				console.log("ERROR :", error)
				return response.send("Password creation failed")
			}
		}
	})

	app.get('/api/profile', async (request, response) => {
		const sess = request.session

		if (sess.userid) {
			try {
				var sql = `SELECT * FROM users
						INNER JOIN user_settings ON users.id = user_settings.user_id
						LEFT JOIN fame_rates ON users.id = fame_rates.user_id
						WHERE users.id = $1`
				var { rows } = await pool.query(sql, [sess.userid])
				const { password: removed_password, ...profileData } = rows[0]

				var sql = `SELECT * FROM tags WHERE tagged_users @> array[$1]::INT[]
						ORDER BY tag_id`
				var tags = await pool.query(sql, [sess.userid])

				profileData.tags = tags.rows.map(tag => tag.tag_content)

				var sql = `SELECT * FROM user_pictures WHERE user_id = $1 AND profile_pic = 'YES'`
				var profile_pic = await pool.query(sql, [sess.userid])

				if (profile_pic.rows[0]) {
					profileData.profile_pic = profile_pic.rows[0]
				} else {
					profileData.profile_pic = { user_id: sess.userid, picture_data: null }
				}

				var sql = `SELECT * FROM user_pictures WHERE user_id = $1 AND profile_pic = 'NO' ORDER BY picture_id`
				var other_pictures = await pool.query(sql, [sess.userid])
				if (other_pictures.rows) {
					profileData.other_pictures = other_pictures.rows
				}

				var sql = `SELECT target_id, username
						FROM likes INNER JOIN users on likes.target_id = users.id
						WHERE liker_id = $1
						GROUP BY target_id, username`
				const liked = await pool.query(sql, [sess.userid])
				profileData.liked = liked.rows

				var sql = `SELECT watcher_id, username
						FROM watches INNER JOIN users on watches.watcher_id = users.id
						WHERE target_id = $1
						GROUP BY watcher_id, username`
				const watchers = await pool.query(sql, [sess.userid])
				profileData.watchers = watchers.rows

				var sql = `SELECT liker_id, username
						FROM likes INNER JOIN users on likes.liker_id = users.id
						WHERE target_id = $1
						GROUP BY liker_id, username`
				const likers = await pool.query(sql, [sess.userid])
				profileData.likers = likers.rows

				response.send(profileData)
			} catch (error) {
				response.send(false)
			}
		} else {
			response.send(false)
		}
	})

	app.post('/api/profile/setprofilepic', upload.single('file'), async (request, response) => {
		const sess = request.session
		const image = 'http://localhost:3000/images/' + request.file.filename

		if (sess.userid) {
			if (request.file.size > 5242880)
				return response.send("The maximum size for uploaded images is 5 megabytes.")
			try {
				let sql = `SELECT * FROM user_pictures WHERE user_id = $1 AND profile_pic = 'YES'`
				let { rows } = await pool.query(sql, [sess.userid])

				if (rows.length === 0) {
					sql = `INSERT INTO user_pictures (user_id, picture_data, profile_pic) VALUES ($1, $2, 'YES')`
					await pool.query(sql, [sess.userid, image])

					sql = `UPDATE fame_rates SET picture_pts = picture_pts + 2, total_pts = total_pts + 2
					WHERE user_id = $1 AND picture_pts < 10 AND total_pts <= 98`
					await pool.query(sql, [sess.userid])

				} else {
					let oldImageData = rows[0]['picture_data']
					const oldImage = path.resolve(__dirname, '../images') + oldImageData.replace('http://localhost:3000/images', '');
					if (fs.existsSync(oldImage)) {
						fs.unlink(oldImage, (err) => {
							if (err) {
								console.error(err);
								return;
							}
						})
					}

					sql = `UPDATE user_pictures SET picture_data = $1 WHERE user_id = $2 AND profile_pic = 'YES'`
					await pool.query(sql, [image, sess.userid])
				}
				response.send(true)
			} catch (error) {
				console.log(error)
				response.send("Image uploading failed for some reason.")
			}
		}
	})

	app.post('/api/profile/imageupload', upload.single('file'), async (request, response) => {
		const sess = request.session
		const image = 'http://localhost:3000/images/' + request.file.filename

		if (sess.userid) {
			if (request.file.size > 5242880)
				return response.send("The maximum size for uploaded images is 5 megabytes.")
			try {
				var sql = `SELECT * FROM user_pictures WHERE user_id = $1`
				var { rows } = await pool.query(sql, [sess.userid])

				if (rows.length < 5) {
					var sql = `INSERT INTO user_pictures (user_id, picture_data, profile_pic) VALUES ($1, $2, 'NO')`
					await pool.query(sql, [sess.userid, image])
					var sql = `UPDATE fame_rates SET picture_pts = picture_pts + 2, total_pts = total_pts + 2
								WHERE user_id = $1 AND picture_pts < 10 AND total_pts <= 98`
					await pool.query(sql, [sess.userid])
					response.send(true)
				} else {
					response.send("You have uploaded too many pictures. Delete some to make room for new ones!")
				}
			} catch (error) {
				console.log(error)
				response.send("Image uploading failed for some reason.")
			}
		}
	})

	app.delete('/api/profile/deletepicture/:id', async (request, response) => {
		const sess = request.session

		if (sess.userid) {
			const picture_id = request.params.id

			var sql = `SELECT * FROM user_pictures WHERE user_id = $1 AND picture_id = $2`
			var { rows } = await pool.query(sql, [sess.userid, picture_id])

			var oldImageData = rows[0]['picture_data']
			if (oldImageData !== 'http://localhost:3000/images/default_profilepic.jpeg') {
				const oldImage = path.resolve(__dirname, '../images') + oldImageData.replace('http://localhost:3000/images', '');

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
			var sql = `UPDATE fame_rates SET picture_pts = picture_pts - 2, total_pts = total_pts - 2
						WHERE user_id = $1 AND picture_pts > 0`
			await pool.query(sql, [sess.userid])
			response.status(200).send("Picture deleted")
		}
	})

	app.get('/api/profile/notifications', async (request, response) => {
		const sess = request.session

		if (sess.userid) {
			try {
				var sql = `SELECT notification_id AS id, notifications.user_id AS user_id, sender_id,
							notification_text AS text, redirect_path, read, picture_data AS picture
							FROM notifications
							INNER JOIN user_pictures ON notifications.sender_id = user_pictures.user_id AND user_pictures.profile_pic = 'YES'
							WHERE notifications.user_id = $1
							ORDER BY notification_id DESC`
				const { rows } = await pool.query(sql, [sess.userid])
				response.send(rows)
			} catch (error) {
				console.log(error)
				response.send(false)
			}
		} else {
			response.send(false)
		}
	})

	app.delete('/api/profile/notifications', (request, response) => {
		const sess = request.session

		if (sess.userid) {
			try {
				var sql = `DELETE FROM notifications WHERE user_id = $1`
				pool.query(sql, [sess.userid])
				response.send(true)
			} catch (error) {
				console.log(error)
				response.send("Failed to clear notifications")
			}
		}
	})

	app.delete('/api/profile/notification/:id', (request, response) => {
		const sess = request.session

		if (sess.userid) {
			try {
				const notification_id = request.params.id
				var sql = `DELETE FROM notifications WHERE user_id = $1 AND notification_id = $2`
				pool.query(sql, [sess.userid, notification_id])
				response.send(true)
			} catch (error) {
				console.log(error)
				response.send("Failed to delete notification")
			}
		}
	})

	app.patch('/api/profile/readnotification/:id', (request, response) => {
		const sess = request.session

		if (sess.userid) {
			try {
				const notification_id = request.params.id
				var sql = `UPDATE notifications SET read = 'YES' WHERE user_id = $1 AND notification_id = $2`
				pool.query(sql, [sess.userid, notification_id])
				response.send(true)
			} catch (error) {
				console.log(error)
				response.send("Failed to read notification")
			}
		}
	})

	app.patch('/api/profile/readnotifications', (request, response) => {
		const sess = request.session

		if (sess.userid) {
			try {
				var sql = `UPDATE notifications SET read = 'YES' WHERE user_id = $1`
				pool.query(sql, [sess.userid])
				response.send(true)
			} catch (error) {
				console.log(error)
				response.send("Failed to read all notifications")
			}
		}
	})

	app.delete('/api/profile/deleteuser', (request, response) => {
		const sess = request.session

		if (sess.userid) {
			try {
				var sql = `DELETE FROM users WHERE id = $1`
				pool.query(sql, [sess.userid])
				var sql = `DELETE FROM likes WHERE target_id = $1`
				pool.query(sql, [sess.userid])
				var sql = `DELETE FROM blocks WHERE target_id = $1`
				pool.query(sql, [sess.userid])
				var sql = `DELETE FROM watches WHERE target_id = $1`
				pool.query(sql, [sess.userid])
				var sql = `DELETE FROM reports WHERE target_id = $1`
				pool.query(sql, [sess.userid])
				var sql = `DELETE FROM connections WHERE user2_id = $1`
				pool.query(sql, [sess.userid])
				var sql = `DELETE FROM notifications WHERE sender_id = $1`
				pool.query(sql, [sess.userid])
				response.send(true)
			} catch (error) {
				console.log(error)
				response.send("Failed to delete user!")
			}
		}
	})
}
