module.exports = (app, pool, session) => {

	app.get('/api/browsing', async (request, response) => {
		const sess = request.session

		try {
			if (sess.userid) {
				var sql = `SELECT id, username, firstname, lastname, gender, age, sexual_pref,
						biography, fame_rating, user_location, picture_data AS profile_pic,
						calculate_distance($2, $3, ip_location[0], ip_location[1], 'K') AS distance
						FROM users
						LEFT JOIN user_settings ON users.id = user_settings.user_id
						LEFT JOIN user_pictures ON users.id = user_pictures.user_id
						WHERE users.id != $1`
				var { rows } = await pool.query(sql, [sess.userid, sess.location[0], sess.location[1]])
				// console.log("Browsing Data: ", rows)
				const browsingData = rows
				// console.log("Browsing Data: ", browsingData)

				// var sql = `SELECT * FROM user_pictures WHERE user_id != $1 AND profile_pic = 'YES'`
				// var profile_pic = await pool.query(sql, [sess.userid])

				// if (profile_pic.rows[0]) {
				// 	profileData.profile_pic = profile_pic.rows[0]['picture_data']
				// }
				// // console.log(profile_pic.rows[0]['picture_data'])

				// var sql = `SELECT * FROM user_pictures WHERE user_id != $1 AND profile_pic = 'NO'`
				// var other_pictures = await pool.query(sql, [sess.userid])
				// // console.log(other_pictures.rows)
				// if (other_pictures.rows) {
				// 	profileData.other_pictures = other_pictures.rows
				// }
				response.send(browsingData)
			} else {
				response.send(false)
			}
		} catch (error) {
			response.send(error)
		}
	})

	app.post('/api/browsing/sorted', async (request, response) => {
		const body = request.body
		const sess = request.session

		try {
			if (sess.userid) {
				const variables = [sess.userid, body.min_age, body.max_age, body.min_fame, body.max_fame, body.sorting, body.sort_order,
				sess.location[0], sess.location[1], body.min_distance, body.max_distance, body.amount, body.offset]
				console.log("Variables: ", body, sess.location[0], sess.location[1])
				var sql = `SELECT *, COUNT(*) OVER() as total_results FROM
						(SELECT id, username, firstname, lastname, gender, age, sexual_pref,
						biography, fame_rating, user_location, picture_data AS profile_pic, blocker_id, target_id,
						calculate_distance($8, $9, ip_location[0], ip_location[1], 'K') AS distance,
						(SELECT COUNT(*) FROM tags WHERE tagged_users @> array[$1,users.id]) AS common_tags
						FROM users
						LEFT JOIN user_settings ON users.id = user_settings.user_id
						LEFT JOIN user_pictures ON users.id = user_pictures.user_id
						LEFT JOIN blocks ON (users.id = blocks.target_id AND blocks.blocker_id = $1) OR
											(users.id = blocks.blocker_id AND blocks.target_id = $1)
						WHERE users.id != $1 AND blocker_id IS NULL AND target_id IS NULL AND users.verified = 'YES'
						AND age BETWEEN $2 and $3 AND fame_rating BETWEEN $4 AND $5
						AND calculate_distance($8, $9, ip_location[0], ip_location[1], 'K') BETWEEN $10 and $11)
						AS x
						ORDER BY (CASE WHEN $6 = 'age' AND $7 = 'asc' THEN age END) ASC,
								(CASE WHEN $6 = 'age' AND $7 = 'desc' THEN age END) DESC,
								(CASE WHEN $6 = 'distance' AND $7 = 'asc' THEN distance END) ASC,
								(CASE WHEN $6 = 'distance' AND $7 = 'desc' THEN distance END) DESC,
								(CASE WHEN $6 = 'fame_rating' AND $7 = 'asc' THEN fame_rating END) ASC,
								(CASE WHEN $6 = 'fame_rating' AND $7 = 'desc' THEN fame_rating END) DESC,
								(CASE WHEN $6 = 'common_tags' AND $7 = 'asc' THEN common_tags END) ASC,
								(CASE WHEN $6 = 'common_tags' AND $7 = 'desc' THEN common_tags END) DESC, username
						LIMIT $12 OFFSET $13`;
				var { rows } = await pool.query(sql, variables)

				var returnedRows = rows.map(user => {
					if (!user.profile_pic)
						return ({ ...user, profile_pic: "http://localhost:3000/images/default_profilepic.jpeg" })
					else
						return (user)
				})
				console.log("Browsing Data To Show: ", returnedRows)
				response.send(returnedRows)
			} else {
				response.send(false)
			}
		} catch (error) {
			response.send(error)
		}
	})

	app.post('/api/browsing/likeuser/:id', async (request, response) => {
		const sess = request.session

		if (sess.userid) {
			var sql = `SELECT picture_data FROM user_pictures WHERE user_id = $1 AND profile_pic = 'YES'`
			const { rows } = await pool.query(sql, [sess.userid])

			if (rows[0]['picture_data'] === 'http://localhost:3000/images/default_profilepic.jpeg') {
				return response.send('No profile picture')
			} else {

				const liked_person_id = request.params.id

				var sql = `INSERT INTO likes (liker_id, target_id) VALUES ($1, $2);`
				await pool.query(sql, [sess.userid, liked_person_id])

				var sql = `SELECT * FROM likes WHERE liker_id = $2 AND target_id = $1`
				const reverseliked = await pool.query(sql, [sess.userid, liked_person_id])

				if (reverseliked.rows.length !== 0) {
					var sql = `INSERT INTO connections (user1_id, user2_id) VALUES ($1, $2)`
					await pool.query(sql, [sess.userid, liked_person_id])
				}

				response.status(200).send("Liked user!")
			}
		}
	})

	app.post('/api/browsing/unlikeuser/:id', async (request, response) => {
		const sess = request.session

		if (sess.userid) {
			const liked_person_id = request.params.id

			var sql = `DELETE FROM likes WHERE liker_id = $1 AND target_id = $2`
			await pool.query(sql, [sess.userid, liked_person_id])

			var sql = `DELETE FROM connections
					WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)`
			const { rows } = await pool.query(sql, [sess.userid, liked_person_id])

			response.status(200).send("Unliked user!")
		}
	})

	app.post('/api/browsing/blockuser/:id', async (request, response) => {
		const sess = request.session

		if (sess.userid) {
			const blocked_person_id = request.params.id

			var sql = `INSERT INTO blocks (blocker_id, target_id) VALUES ($1, $2)`
			await pool.query(sql, [sess.userid, blocked_person_id])

			var sql = `DELETE FROM likes WHERE (liker_id = $1 AND target_id = $2) OR (liker_id = $2 AND target_id = $1)`
			await pool.query(sql, [sess.userid, blocked_person_id])

			var sql = `DELETE FROM connections
					WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)`
			await pool.query(sql, [sess.userid, blocked_person_id])

			response.status(200).send("Blocked user!")
		}
	})

	app.get('/api/browsing/userlists', async (request, response) => {
		const sess = request.session
		if (sess.userid) {
			var sql = `SELECT target_id FROM likes WHERE liker_id = $1`
			console.log("Getting likes...")
			const likedusers = await pool.query(sql, [sess.userid])
			const likedUserIds = likedusers.rows.map(user => user.target_id)

			var sql = `SELECT user2_id FROM connections WHERE user1_id = $1`
			console.log("Getting connections...")
			var results1 = await pool.query(sql, [sess.userid])
			var sql = `SELECT user1_id FROM connections WHERE user2_id = $1`
			var results2 = await pool.query(sql, [sess.userid])
			const connectedusers = results1.rows.concat(results2.rows)
			const connectedUserIds = connectedusers.map(result => {
				if (result.user1_id)
					return (result.user1_id)
				else if (result.user2_id)
					return (result.user2_id)
			})

			var sql = `SELECT target_id FROM blocks WHERE blocker_id = $1`
			console.log("Getting blocks...")
			const blockedusers = await pool.query(sql, [sess.userid])
			const blockedUserIds = blockedusers.rows.map(user => user.target_id)

			const userLists = { liked: likedUserIds, connected: connectedUserIds, blocked: blockedUserIds }
			console.log("Userlists: ", userLists)
			response.send(userLists)
		}
	})

	app.get('/api/browsing/userprofile/:id', async (request, response) => {
		const sess = request.session

		try {
			const profile_id = request.params.id
			var sql = `SELECT * FROM users
						INNER JOIN user_settings ON users.id = user_settings.user_id
						WHERE users.id = $1`
			var { rows } = await pool.query(sql, [profile_id])
			// console.log("Profile Data: ", rows[0])
			const { password: removed_password, ...profileData } = rows[0]
			// console.log("Profile Data: ", profileData)

			var sql = `SELECT * FROM tags WHERE tagged_users @> array[$1]::INT[]
						ORDER BY tag_id`
			var tags = await pool.query(sql, [profile_id])

			profileData.tags = tags.rows.map(tag => tag.tag_content)

			var sql = `SELECT * FROM user_pictures WHERE user_id = $1 AND profile_pic = 'YES'`
			var profile_pic = await pool.query(sql, [profile_id])

			if (profile_pic.rows[0]) {
				profileData.profile_pic = profile_pic.rows[0]
			} else {
				profileData.profile_pic = { user_id: sess.userid, picture_data: 'http://localhost:3000/images/default_profilepic.jpeg' }
			}
			// console.log(profile_pic.rows[0]['picture_data'])

			var sql = `SELECT * FROM user_pictures WHERE user_id = $1 AND profile_pic = 'NO' ORDER BY picture_id`
			var other_pictures = await pool.query(sql, [profile_id])
			// console.log(other_pictures.rows)
			if (other_pictures.rows) {
				profileData.other_pictures = other_pictures.rows
			}
			response.send(profileData)
		} catch (error) {
			response.send(false)
		}
	})

}
