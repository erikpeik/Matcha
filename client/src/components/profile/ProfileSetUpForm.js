import axios from 'axios'
import { useState, useEffect } from 'react'
import { changeNotification } from '../../reducers/notificationReducer'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
	Typography, Button, Paper, TextField, FormControl, FormLabel, createTheme,
	RadioGroup, FormControlLabel, Radio, InputLabel, Select, MenuItem, TextareaAutosize
} from '@mui/material'
import { Container } from '@mui/system'
import { IconUserCircle } from '@tabler/icons'
import Notification from '../Notification'
import { changeSeverity } from '../../reducers/severityReducer'
import { getProfileData } from '../../reducers/profileReducer'
import profileService from '../../services/profileService'
import Loader from '../Loader'

const ProfileSetUpForm = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const [age, setAge] = useState('');
	const [sexual_pref, setSexpref] = useState('bisexual');
	const [GPSlocation, setGPSLocation] = useState({
		latitude: 60.5,
		longitude: 26.5,
		city: '',
		country_name: ''
	})
	const [isLoading, setLoading] = useState(true)

	const theme = createTheme({
		palette: {
			primary: {
				main: '#FF1E56',
			},
			secondary: {
				main: '#F5F5F5',
			},
		}
	})

	useEffect(() => {
		const getLocationData = async () => {
			// var locationData = {
			// 	data: {
			// 		latitude: 60.5,
			// 		longitude: 26.5,
			// 		city: '',
			// 		country_name: ''
			// 	}
			// }
			var locationData = await axios.get('https://geolocation-db.com/json/')
			const result = await navigator.permissions.query({ name: "geolocation" });
			if (result.state === 'granted') {
				console.log(navigator.geolocation)
				await navigator.geolocation.getCurrentPosition(position => {
					console.log(position.coords.latitude)
					console.log(position.coords.longitude)
					locationData.data.latitude = position.coords.latitude
					locationData.data.longitude = position.coords.longitude
					setGPSLocation(locationData.data)
					setLoading(false)
				})
				console.log(locationData.data)
			} else {
				setGPSLocation(locationData.data)
				setLoading(false)
			}
		}
		getLocationData()
	}, [setLoading])

	if (isLoading) {
		return <Loader />
	}

	const submitUserInfo = (event) => {
		event.preventDefault()

		const ProfileSettings = {
			gender: event.target.gender.value,
			age: event.target.age.value,
			city: event.target.location.value,
			gps: [event.target.gps_lat.value, event.target.gps_lon.value],
			sexual_pref: event.target.sexual_pref.value,
			biography: event.target.biography.value
		}

		console.log(ProfileSettings)

		profileService.setUpProfile(ProfileSettings).then((result) => {
			if (result === true) {
				dispatch(changeSeverity('success'))
				dispatch(changeNotification("Profile Settings Updated"))
				dispatch(getProfileData())
				navigate('/profile')
			} else {
				dispatch(changeSeverity('error'))
				dispatch(changeNotification(result))
			}
		})

		console.log("Profile Settings: ", ProfileSettings)
	}

	const imageStyle = {
		display: 'relative',
		marginLeft: 'calc(50% + 5px)',
		transform: 'translate(-50%)',
		filter: 'drop-shadow(0px 0px 3px rgb(241 25 38 / 0.8))',
	}

	const handleAge = (event) => {
		setAge(event.target.value);
	}

	const handleSexpref = (event) => {
		setSexpref(event.target.value);
	}

	return (
		<Container maxWidth='md' sx={{ pt: 5, pb: 5 }}>
			<Paper elevation={10} sx={{ padding: 3 }}>
				<IconUserCircle size={100} color="#F11926" style={imageStyle} />
				<Typography variant='h5' align='center'
					sx={{ fontWeight: 550 }}>Profile</Typography>
				<Typography align='center' xs={{ mb: 4 }}>
					Please enter some details about yourself
				</Typography>
				<form onSubmit={submitUserInfo}>
					<FormControl sx={{ mb: 2 }}>
						<FormLabel id='gender'>Gender</FormLabel>
						<RadioGroup row aria-labelledby='gender' name='gender'>
							<FormControlLabel value='female' control={<Radio />} label='Female' />
							<FormControlLabel value='male' control={<Radio />} label='Male' />
							<FormControlLabel value='other' control={<Radio />} label='Other' />
						</RadioGroup>
					</FormControl>
					<FormControl fullWidth sx={{ mb: 2 }}>
						<InputLabel id='age'>Age</InputLabel>
						<Select labelId='age' id='age' name='age' value={age} onChange={handleAge} required>
							{[...Array(103).keys()].map((i) => (
								<MenuItem value={i + 18} key={i + 18}>{i + 18}</MenuItem>
							))}
						</Select>
					</FormControl>
					<TextField fullWidth margin='normal' name="location" label='Location' value={`${GPSlocation.city}, ${GPSlocation.country_name}`}
						placeholder="Location" sx={{ mb: 2 }} required></TextField>
					<TextField fullWidth margin='normal' name="gps_lat" label='GPS latitude' value={GPSlocation.latitude}
						placeholder="GPS latitude" sx={{ mb: 2, width: 300 }} required></TextField>
					<TextField fullWidth margin='normal' name="gps_lon" label='GPS longitude' value={GPSlocation.longitude}
						placeholder="GPS longitude" sx={{ ml: 2, mb: 2, width: 300 }} required></TextField>
					<FormControl sx={{ mb: 2 }}>
						<FormLabel id='sexual_pref'>Sexual Preference</FormLabel>
						<RadioGroup row aria-labelledby='sexual_pref' name='sexual_pref' value={sexual_pref} onChange={handleSexpref} >
							<FormControlLabel value='bisexual' control={<Radio />} label='Bisexual' />
							<FormControlLabel value='male' control={<Radio />} label='Male' />
							<FormControlLabel value='female' control={<Radio />} label='Female' />
						</RadioGroup>
					</FormControl>
					<br />
					<FormLabel id='biography' >Biography</FormLabel>
					<TextareaAutosize
						name='biography'
						style={{ width: '100%', marginTop: '10px' }}
						maxLength={500}
						minRows={5}
						placeholder='Short description of you here...'
					/>
					<Button type="submit" variant='contained' theme={theme}
						size='large' sx={{ mt: 1 }}>
						Save settings
					</Button>
				</form>
				<Notification />
			</Paper>
		</Container>
	)

}

export default ProfileSetUpForm