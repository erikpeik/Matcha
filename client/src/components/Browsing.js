import { useState, useEffect } from 'react'
// import { changeNotification } from '../reducers/notificationReducer'
// import { useDispatch } from 'react-redux'
// import {
// 	Typography, Button, Paper, TextField, FormControl, FormLabel, createTheme,
// 	RadioGroup, FormControlLabel, Radio, InputLabel, Select, MenuItem, TextareaAutosize,
// } from '@mui/material'
// import { Container } from '@mui/system';
// import { IconUserCircle } from '@tabler/icons';
// import Notification from './Notification'
// import { changeSeverity } from '../reducers/severityReducer'
// import { getProfileData } from '../reducers/profileReducer'
import browsingService from '../services/browsingService'

const Browsing = () => {
	const [isLoading, setLoading] = useState(true);
	const [users, setUsers] = useState([])

	useEffect(() => {
		const getAllUsers = async (users) => {
			const fetchedUsers = await browsingService.getAll()
			setUsers(fetchedUsers)
			console.log(Array.from(fetchedUsers))
			setLoading(false);
		}
		getAllUsers()
	}, [])

	if (isLoading) {
		return <div>Loading...</div>;
	} else {
		const profile_pic = require('../images/demo_profilepic.jpeg')
		return (
			<>
				{users.map(user =>
					<div id="profile_container">
						<div id="picture_container">
							<img key={user.id} alt="profile_picture" src={profile_pic} height="200px"></img>
						</div>
						<div id="profile_data">
							<h1>{user.username}</h1>
							<h3>Fame rating: {user.fame_rating}</h3>
							<br></br>
							<p>First name: {user.firstname}</p>
							<p>Last name: {user.lastname}</p>
							<p>Gender: {user.gender}</p>
							<p>Age: {user.age}</p>
							<p>Sexual preference: {user.sexual_pref}</p>
							<p>Location: {user.user_location}</p>
							<p>Biography: {user.biography}</p>
						</div>
					</div>
				)}
			</>
		)
	}
}

export default Browsing
