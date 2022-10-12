import axios from 'axios'
import { useState, useEffect } from 'react'
import { changeNotification } from '../../reducers/notificationReducer'
import { useDispatch } from 'react-redux'
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
import { getProfileData } from '../../reducers/profileReducer'
import profileService from '../../services/profileService'
import Loader from '../Loader'
import { TagsInput } from './ProfileSettings'

const ProfileSetUpForm = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const [gender, setGender] = useState('female');
	const [age, setAge] = useState('');
	const [sexual_pref, setSexpref] = useState('bisexual');
	const [GPSlocation, setGPSLocation] = useState()
	const [tags, setTagState] = useState([])
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

	const themeBlack = createTheme({
		palette: {
			primary: {
				main: '#000000',
			},
			secondary: {
				main: '#F5F5F5',
			},
		}
	})

	const getLocationData = async () => {
		var locationData = await axios.get('https://ipapi.co/json')
		var newGPSLocation = {
			latitude: Number(locationData.data.latitude),
			longitude: Number(locationData.data.longitude),
			location: `${locationData.data.city}, ${locationData.data.country_name}`
		}

		const result = await navigator.permissions.query({ name: "geolocation" });

		const successGeolocation = async (position) => {
			newGPSLocation.latitude = Number(position.coords.latitude)
			newGPSLocation.longitude = Number(position.coords.longitude)
			var city_data = await axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`)
			newGPSLocation.location = `${city_data.data.city}, ${city_data.data.countryName}`
			setGPSLocation(newGPSLocation)
			setLoading(false)
		}

		const geolocationOptions = {
			enableHighAccuracy: true,
			maximumAge: 0
		}

		if (result.state === 'granted') {
			navigator.geolocation.getCurrentPosition(
				successGeolocation,
				null,
				geolocationOptions
			)
		} else {
			setGPSLocation(newGPSLocation)
			setLoading(false)
		}
	}

	useEffect(() => {
		getLocationData()
	}, [])

	if (isLoading) {
		return <Loader text="Finding your location..." />
	}

	const submitUserInfo = (event) => {
		event.preventDefault()

		const ProfileSettings = {
			gender: event.target.gender.value,
			age: event.target.age.value,
			location: event.target.location.value,
			gps: [event.target.gps_lat.value, event.target.gps_lon.value],
			sexual_pref: event.target.sexual_pref.value,
			biography: event.target.biography.value,
			tags: tags
		}

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
	}

	const imageStyle = {
		display: 'relative',
		marginLeft: 'calc(50% + 5px)',
		transform: 'translate(-50%)',
		filter: 'drop-shadow(0px 0px 3px rgb(241 25 38 / 0.8))',
	}

	const handleGender = (event) => {
		setGender(event.target.value);
	}

	const handleAge = (event) => {
		setAge(event.target.value);
	}

	const handleSexpref = (event) => {
		setSexpref(event.target.value);
	}

	const handleLocation = (event) => {
		setGPSLocation({ ...GPSlocation, location: event.target.value })
	}

	const handleGPSLat = (event) => {
		setGPSLocation({ ...GPSlocation, latitude: event.target.value })
	}

	const handleGPSLon = (event) => {
		setGPSLocation({ ...GPSlocation, longitude: event.target.value })
	}

	const handleLocationSearch = async () => {
		getLocationData()
	}

	const uploadImage = async (event) => {
		const image = event.target.files[0]
		if (image.size > 5242880) {
			dispatch(changeSeverity('error'))
			dispatch(changeNotification("The maximum size for uploaded images is 5 megabytes."))

		} else {
			let formData = new FormData()
			formData.append('file', image)
			const result = await profileService.uploadPicture(formData)
			if (result === true) {
				dispatch(getProfileData())
				dispatch(changeSeverity('success'))
				dispatch(changeNotification("Image uploaded successfully!"))
			} else {
				dispatch(changeSeverity('error'))
				dispatch(changeNotification(result))
			}
		}
		event.target.value = ''
	}

	const setProfilePicture = async (event) => {
		const image = event.target.files[0]
		if (image.size > 5242880) {
			dispatch(changeSeverity('error'))
			dispatch(changeNotification("The maximum size for uploaded images is 5 megabytes."))

		} else {
			let formData = new FormData()
			formData.append('file', image)
			const result = await profileService.setProfilePic(formData)
			if (result === true) {
				dispatch(getProfileData())
				dispatch(changeSeverity('success'))
				dispatch(changeNotification("Profile picture set!"))
			} else {
				dispatch(changeSeverity('error'))
				dispatch(changeNotification(result))
			}
		}
		event.target.value = ''
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
						<RadioGroup row aria-labelledby='gender' name='gender' value={gender} onChange={handleGender}>
							<FormControlLabel value='female' control={<Radio />} label='Female' />
							<FormControlLabel value='male' control={<Radio />} label='Male' />
							<FormControlLabel value='other' control={<Radio />} label='Other' />
						</RadioGroup>
					</FormControl>
					<FormControl fullWidth sx={{ mb: 2 }}>
						<InputLabel id='age' required>Age</InputLabel>
						<Select labelId='age' id='age' name='age' value={age} onChange={handleAge} required>
							{[...Array(103).keys()].map((i) => (
								<MenuItem value={i + 18} key={i + 18}>{i + 18}</MenuItem>
							))}
						</Select>
					</FormControl>
					<TextField fullWidth margin='normal' name="location" label='Location' value={GPSlocation.location}
						onChange={handleLocation} placeholder="Location" sx={{ mb: 2 }} required></TextField>
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						<TextField fullWidth margin='normal' name="gps_lat" label='GPS latitude' value={GPSlocation.latitude}
							onChange={handleGPSLat} placeholder="GPS latitude" sx={{ mb: 2, width: 300 }} required></TextField>
						<TextField fullWidth margin='normal' name="gps_lon" label='GPS longitude' value={GPSlocation.longitude}
							onChange={handleGPSLon} placeholder="GPS longitude" sx={{ ml: 2, mb: 2, width: 300 }} required></TextField>
						<Tooltip title="Locate with GPS">
							<IconButton onClick={handleLocationSearch} sx={{ ml: 3 }}>
								<LocationSearchingIcon />
							</IconButton>
						</Tooltip>
					</Box>
					<FormControl sx={{ mb: 2 }}>
						<FormLabel id='sexual_pref'>Sexual Preference</FormLabel>
						<RadioGroup row aria-labelledby='sexual_pref' name='sexual_pref' value={sexual_pref} onChange={handleSexpref} >
							<FormControlLabel value='bisexual' control={<Radio />} label='Bisexual' />
							<FormControlLabel value='male' control={<Radio />} label='Male' />
							<FormControlLabel value='female' control={<Radio />} label='Female' />
						</RadioGroup>
					</FormControl>
					<br />
					<FormLabel id='biography' required>Biography</FormLabel>
					<TextareaAutosize
						name='biography'
						style={{ width: '100%', marginTop: '10px' }}
						maxLength={500}
						minRows={5}
						placeholder='Short description of you here...'
						required
					/>
					<TagsInput tags={tags} setTags={setTagState} formerTags={[]} />
					<Box sx={{ mt: 1, mb: 1 }}>
						<Button theme={themeBlack}>
							<label htmlFor="set_profilepic" className="styled-image-upload">
								Set profile picture
							</label>
							<input type="file" name="file" id="set_profilepic" accept="image/jpeg, image/png, image/jpg" onChange={setProfilePicture}></input>
						</Button>
						<Button theme={themeBlack}>
							<label htmlFor="image-upload" className="styled-image-upload">
								ADD OTHER PICTURE
							</label>
							<input type="file" name="file" id="image-upload" accept="image/jpeg, image/png, image/jpg"
								onChange={uploadImage}></input>
						</Button>
					</Box>
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
