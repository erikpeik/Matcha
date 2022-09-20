import axios from 'axios'
import { useState, useEffect } from 'react'
// import { changeNotification } from '../reducers/notificationReducer'
// import { useDispatch } from 'react-redux'
import {
	Typography, Button, Paper, TextField, FormControl, FormLabel, createTheme,
	RadioGroup, FormControlLabel, Radio, InputLabel, Select, MenuItem, TextareaAutosize, Box, Slider
} from '@mui/material'
// import { Container } from '@mui/system';
// import { IconUserCircle } from '@tabler/icons';
// import Notification from './Notification'
// import { changeSeverity } from '../reducers/severityReducer'
// import { getProfileData } from '../reducers/profileReducer'
import browsingService from '../services/browsingService'

const Browsing = () => {
	const [isLoading, setLoading] = useState(true);
	const [users, setUsers] = useState([])
	const [searchCriteria, setSearchCriteria] = useState({
		min_age: 18,
		max_age: 99,
		min_fame: 0,
		max_fame: 100,
		min_distance: 0,
		max_distance: 20000,
		location: 'any',
		sorting: 'age',
		sort_order: 'asc',
		amount: 2,
	})

	useEffect(() => {
		const getAllUsers = async (users) => {
			const fetchedUsers = await browsingService.getAll()
			setUsers(fetchedUsers)
			// console.log(fetchedUsers)
			setLoading(false);
		}
		getAllUsers()
	}, [])

	const handleAmount = async (event) => {
		const searchValues = { ...searchCriteria, amount: event.target.value }
		var sortedUsers = await browsingService.getSortedUsers(searchValues)
		setSearchCriteria(searchValues)
		setUsers(sortedUsers)
	}

	const handleSorting = async (event) => {
		const searchValues = { ...searchCriteria, sorting: event.target.value }
		var sortedUsers = await browsingService.getSortedUsers(searchValues)
		setSearchCriteria(searchValues)
		setUsers(sortedUsers)
	}

	const handleSortOrder = async (event) => {
		const searchValues = { ...searchCriteria, sort_order: event.target.value }
		var sortedUsers = await browsingService.getSortedUsers(searchValues)
		setSearchCriteria(searchValues)
		setUsers(sortedUsers)
	}

	const handleAgeSlider = async (event) => {
		const searchValues = { ...searchCriteria, min_age: event.target.value[0], max_age: event.target.value[1] }
		var sortedUsers = await browsingService.getSortedUsers(searchValues)
		setSearchCriteria(searchValues)
		setUsers(sortedUsers)
	}

	const handleFameSlider = async (event) => {
		const searchValues = { ...searchCriteria, min_fame: event.target.value[0], max_fame: event.target.value[1] }
		var sortedUsers = await browsingService.getSortedUsers(searchValues)
		setSearchCriteria(searchValues)
		setUsers(sortedUsers)
	}

	const handleDistanceSlider = async (event) => {
		const searchValues = { ...searchCriteria, min_distance: event.target.value[0], max_distance: event.target.value[1] }
		var sortedUsers = await browsingService.getSortedUsers(searchValues)
		setSearchCriteria(searchValues)
		setUsers(sortedUsers)
	}

	if (isLoading) {
		return <div>Loading...</div>;
	} else {
		const profile_pic = require('../images/demo_profilepic.jpeg')
		return (
			<>
				<FormControl fullWidth sx={{ mb: 2 }}>
					<InputLabel id='amount'>Amount of results:</InputLabel>
					<Select labelId='amount' id='amount' name='amount' value={searchCriteria.amount} onChange={handleAmount} required>
						{[...Array(5).keys()].map((i) => (
							<MenuItem value={i + 1} key={i + 1}>{i + 1}</MenuItem>
						))}
					</Select>
				</FormControl>
				<Box sx={{ width: 300 }}>
					<InputLabel id='ageslider'>Filter by age:</InputLabel>
					<Slider
						min={18}
						max={99}
						aria-labelledby='age range'
						value={[searchCriteria.min_age, searchCriteria.max_age]}
						onChange={handleAgeSlider}
						valueLabelDisplay="auto"
						// getAriaValueText={valuetext}
					/>
				</Box>
				<Box sx={{ width: 300 }}>
					<InputLabel id='fameslider'>Filter by fame rating:</InputLabel>
					<Slider
						aria-labelledby='fame range'
						value={[searchCriteria.min_fame, searchCriteria.max_fame]}
						onChange={handleFameSlider}
						valueLabelDisplay="auto"
						// getAriaValueText={valuetext}
					/>
				</Box>
				<Box sx={{ width: 300 }}>
					<InputLabel id='distanceslider'>Filter by distance:</InputLabel>
					<Slider
						min={0}
						max={20000}
						aria-labelledby='distance range'
						value={[searchCriteria.min_distance, searchCriteria.max_distance]}
						onChange={handleDistanceSlider}
						valueLabelDisplay="auto"
						// getAriaValueText={valuetext}
					/>
				</Box>
				<FormControl sx={{ mb: 2 }}>
					<FormLabel id='sorted_by'>Results sorted by:</FormLabel>
					<RadioGroup row aria-labelledby='sorted_by' name='sorted_by' onChange={handleSorting}>
						<FormControlLabel value='age' control={<Radio />} label='Age' />
						<FormControlLabel value='user_location' control={<Radio />} label='Location' />
						<FormControlLabel value='fame_rating' control={<Radio />} label='Fame Rating' />
						<FormControlLabel value='common_tags' control={<Radio />} label='Common tags' />
					</RadioGroup>
				</FormControl>
				<Box>
				<FormControl sx={{ mb: 2 }}>
					<FormLabel id='asc_desc'></FormLabel>
					<RadioGroup row aria-labelledby='asc_desc' name='asc_desc' onChange={handleSortOrder}>
						<FormControlLabel value='asc' control={<Radio />} label='Ascending' />
						<FormControlLabel value='desc' control={<Radio />} label='Descending' />
					</RadioGroup>
				</FormControl>
				</Box>
				{users.map(user =>
					<div id="profile_container">
						<div id="picture_container">
							<img key={user.uniqueId} alt="profile_picture" src={profile_pic} height="200px"></img>
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
							<p>Distance: {Math.floor(user.distance)} km</p>
							<p>Biography: {user.biography}</p>
						</div>
					</div>
				)}
			</>
		)
	}
}

export default Browsing
