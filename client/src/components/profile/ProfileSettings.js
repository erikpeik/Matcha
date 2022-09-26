import { useState, useEffect } from 'react'
import { changeNotification } from '../../reducers/notificationReducer'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
	Typography, Button, Paper, TextField, FormControl, FormLabel, createTheme,
	RadioGroup, FormControlLabel, Radio, InputLabel, Select, MenuItem, TextareaAutosize
} from '@mui/material'
import { Container } from '@mui/system'
import { IconUserCircle } from '@tabler/icons'
import Notification from '../Notification'
import { changeSeverity } from '../../reducers/severityReducer'
import profileService from '../../services/profileService'
import Loader from '../Loader'
import ProfileSetUpForm from './ProfileSetUpForm'

const TagsInput = ({tags, setTags}) => {

	const handleTagChange = (event) => {
		if (event.key !== 'Enter' || event.target.value === '')
			return
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
	const [tags, setTagState] = useState(profileData.tags)

	useEffect(() => {
		if (profileData) {
			changeSettings({
				username: profileData.username,
				firstname: profileData.firstname,
				lastname: profileData.lastname,
				email: profileData.email,
				gender: profileData.gender,
				age: profileData.age,
				location: profileData.user_location,
				sexual_pref: profileData.sexual_pref,
				biography: profileData.biography,
				tags: profileData.tags
			})
		}
		setLoading(false)
	}, [profileData])

	if (isLoading) {
		return <Loader />
	}
	if (!profileData.id)
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
					<TextField fullWidth margin='dense' name="email" label='E-mail'
						placeholder="E-mail" value={settings.email} onChange={handleEmail} required></TextField>
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
					<Button type="submit" variant='contained' theme={theme}
						size='large' sx={{ mt: 1 }}>
						Save settings
					</Button>
				</form>
				<FormLabel id='tags' >Tags</FormLabel>
				<TagsInput tags={tags} setTags={setTags}/>
				<Notification />
			</Paper>
		</Container>
	)

}

export default ProfileSettings