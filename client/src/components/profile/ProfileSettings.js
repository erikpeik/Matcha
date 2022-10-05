import axios from 'axios'
import { useState, useEffect } from 'react'
import { changeNotification, resetNotification } from '../../reducers/notificationReducer'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
	Typography, Button, Paper, TextField, FormControl, FormLabel, createTheme,
	RadioGroup, FormControlLabel, Radio, InputLabel, Select, MenuItem, TextareaAutosize, Box
} from '@mui/material'
import { Tooltip, IconButton } from '@mui/material'
import LocationSearchingIcon from '@mui/icons-material/LocationSearching'
import { Container } from '@mui/system'
import { IconUserCircle } from '@tabler/icons'
import Notification from '../Notification'
import { changeSeverity } from '../../reducers/severityReducer'
import profileService from '../../services/profileService'
import Loader from '../Loader'
import ProfileSetUpForm from './ProfileSetUpForm'

const TagsInput = ({ tags, setTags }) => {

	const handleTagChange = (event) => {
		if (event.key !== 'Enter' || event.target.value === '')
			return
		event.preventDefault()
		setTags([...tags, event.target.value])
		event.target.value = ''
	}

	const removeTag = (index) => {
		setTags(tags.filter((tag, i) => i !== index))
	}

	return (
		<div className="tags-input-container">
			{tags.map((tag, index) => (
				<div className="tag-item" key={index}>
					<span className="text">{tag}</span>
					<span className="close" onClick={() => removeTag(index)}>&times;</span>
				</div>
			))}
			<input onKeyDown={handleTagChange} type="text" className="tags-input" placeholder="Enter tag text" />
		</div>
	)
}

const ProfileSettings = () => {
	const [isLoading, setLoading] = useState(true);
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const profileData = useSelector(state => state.profile)
	const [settings, changeSettings] = useState({})
	const [tags, setTagState] = useState([])

	useEffect(() => {
		dispatch(resetNotification())
		if (profileData) {
			changeSettings({
				username: profileData.username,
				firstname: profileData.firstname,
				lastname: profileData.lastname,
				email: profileData.email,
				gender: profileData.gender,
				age: profileData.age,
				location: profileData.user_location,
				gps_lat: profileData.ip_location.x,
				gps_lon: profileData.ip_location.y,
				sexual_pref: profileData.sexual_pref,
				biography: profileData.biography,
				tags: profileData.tags
			})
			setTagState(profileData.tags)
		}
		setLoading(false)
	}, [dispatch, profileData])

	if (isLoading) {
		return <Loader />
	}
	if (!profileData || !profileData.id)
		return <ProfileSetUpForm />

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

	const submitSettings = (event) => {
		event.preventDefault()

		profileService.editUserSettings(settings).then((result) => {
			if (result === true) {
				dispatch(changeSeverity('success'))
				dispatch(changeNotification("Profile Settings Updated"))
				navigate('/profile')
			} else {
				dispatch(changeSeverity('error'))
				dispatch(changeNotification(result))
			}
		})

		console.log("Profile Settings: ", settings)
	}

	const imageStyle = {
		display: 'relative',
		marginLeft: 'calc(50% + 5px)',
		transform: 'translate(-50%)',
		filter: 'drop-shadow(0px 0px 3px rgb(241 25 38 / 0.8))',
	}

	const handleUsername = (event) => {
		changeSettings({ ...settings, username: event.target.value })
	}

	const handleFirstname = (event) => {
		changeSettings({ ...settings, firstname: event.target.value })
	}

	const handleLastname = (event) => {
		changeSettings({ ...settings, lastname: event.target.value })
	}

	const handleEmail = (event) => {
		changeSettings({ ...settings, email: event.target.value })
	}

	const handleGender = (event) => {
		changeSettings({ ...settings, gender: event.target.value })
	}

	const handleAge = (event) => {
		changeSettings({ ...settings, age: event.target.value })
	}

	const handleLocation = (event) => {
		changeSettings({ ...settings, location: event.target.value })
	}

	const handleGPSLat = (event) => {
		changeSettings({ ...settings, gps_lat: event.target.value })
	}

	const handleGPSLon = (event) => {
		changeSettings({ ...settings, gps_lon: event.target.value })
	}

	const handleLocationSearch = async () => {
		var locationData = await axios.get('https://ipapi.co/json')
		console.log(locationData.data)
		var newGPSLocation = {
			latitude: locationData.data.latitude,
			longitude: locationData.data.longitude,
			location: `${locationData.data.city}, ${locationData.data.country_name}`
		}

		const result = await navigator.permissions.query({ name: "geolocation" });
		if (result.state === 'granted') {
			await navigator.geolocation.getCurrentPosition(position => {
				console.log(newGPSLocation)
				changeSettings({
					...settings,
					location: newGPSLocation.location,
					gps_lat: position.coords.latitude,
					gps_lon: position.coords.longitude
				})
				setLoading(false)
			})
		} else {
			changeSettings({
				...settings,
				location: newGPSLocation.location,
				gps_lat: newGPSLocation.latitude,
				gps_lon: newGPSLocation.longitude
			})
			setLoading(false)
		}
	}

	const handleSexpref = (event) => {
		changeSettings({ ...settings, sexual_pref: event.target.value })
	}

	const handleBiography = (event) => {
		changeSettings({ ...settings, biography: event.target.value })
	}

	const setTags = (tagData) => {
		setTagState(tagData)
		changeSettings({ ...settings, tags: tagData })
	}

	return (
		<Container maxWidth='md' sx={{ pt: 5, pb: 5 }}>
			<Paper elevation={10} sx={{ padding: 3 }}>
				<IconUserCircle size={100} color="#F11926" style={imageStyle} />
				<Typography variant='h5' align='center'
					sx={{ fontWeight: 550 }}>Profile</Typography>
				<Typography align='center' xs={{ mb: 4 }}>
					Here you can edit your profile settings
				</Typography>
				<form onSubmit={submitSettings}>
					<TextField fullWidth margin='normal' name="username" label='Username'
						placeholder="Username" value={settings.username} onChange={handleUsername} required></TextField>
					<TextField sx={{ width: '49%', mr: '1%' }} margin='dense' name="firstname"
						label='First name' placeholder="First name" value={settings.firstname} onChange={handleFirstname} required></TextField>
					<TextField sx={{ width: '49%', ml: '1%' }} margin='dense' name="lastname"
						label='Last name' placeholder="Last name" value={settings.lastname} onChange={handleLastname} required></TextField>
					<TextField type="email" fullWidth margin='dense' name="email" label='E-mail' autoComplete="email"
						placeholder="E-mail" value={settings.email} onChange={handleEmail} required />
					<FormControl sx={{ mb: 2 }}>
						<FormLabel id='gender'>Gender</FormLabel>
						<RadioGroup row aria-labelledby='gender' name='gender' value={settings.gender} onChange={handleGender}>
							<FormControlLabel value='female' control={<Radio />} label='Female' />
							<FormControlLabel value='male' control={<Radio />} label='Male' />
							<FormControlLabel value='other' control={<Radio />} label='Other' />
						</RadioGroup>
					</FormControl>
					<FormControl fullWidth sx={{ mb: 2 }}>
						<InputLabel id='age'>Age</InputLabel>
						<Select labelId='age' id='age' name='age' value={settings.age} onChange={handleAge} required>
							{[...Array(103).keys()].map((i) => (
								<MenuItem value={i + 18} key={i + 18}>{i + 18}</MenuItem>
							))}
						</Select>
					</FormControl>
					<TextField fullWidth margin='normal' name="location" label='Location' value={settings.location} onChange={handleLocation}
						placeholder="Location" sx={{ mb: 2 }} required></TextField>
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						<TextField fullWidth margin='normal' name="gps_lat" label='GPS latitude' value={settings.gps_lat} onChange={handleGPSLat}
							placeholder="GPS latitude" sx={{ mb: 2, width: 300 }} required></TextField>
						<TextField fullWidth margin='normal' name="gps_lon" label='GPS longitude' value={settings.gps_lon} onChange={handleGPSLon}
							placeholder="GPS longitude" sx={{ ml: 2, mb: 2, width: 300 }} required></TextField>
						<Tooltip title="Locate with GPS">
							<IconButton onClick={handleLocationSearch} sx={{ ml: 3 }}>
								<LocationSearchingIcon />
							</IconButton>
						</Tooltip>
					</Box >
					<FormControl sx={{ mb: 2 }}>
						<FormLabel id='sexual_pref'>Sexual Preference</FormLabel>
						<RadioGroup row aria-labelledby='sexual_pref' name='sexual_pref' value={settings.sexual_pref} onChange={handleSexpref} >
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
						value={settings.biography}
						onChange={handleBiography}
						placeholder='Short description of you here...'
					/>
					<FormLabel id='tags' >Tags</FormLabel>
					<TagsInput tags={tags} setTags={setTags} />
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

export default ProfileSettings