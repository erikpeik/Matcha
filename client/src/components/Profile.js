import { useState, useEffect } from 'react'
import { changeNotification } from '../reducers/notificationReducer'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
	Typography, Button, Paper, TextField, FormControl, FormLabel, createTheme,
	RadioGroup, FormControlLabel, Radio, InputLabel, Select, MenuItem, TextareaAutosize,
	Box, Grid, Rating, styled
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { Container } from '@mui/system'
import { IconUserCircle } from '@tabler/icons'
import Notification from './Notification'
import { changeSeverity } from '../reducers/severityReducer'
import { getProfileData } from '../reducers/profileReducer'
import profileService from '../services/profileService'
import Loader from './Loader'

const StyledRating = styled(Rating)({
	'& .MuiRating-iconFilled': {
		color: '#ff6d75',
	},
	'& .MuiRating-iconHover': {
		color: '#ff3d47',
	},
})

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

export const ProfileSetUpForm = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()

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

	const submitUserInfo = (event) => {
		event.preventDefault()

		const ProfileSettings = {
			gender: event.target.gender.value,
			age: event.target.age.value,
			location: event.target.location.value,
			sexual_pref: event.target.sexual_pref.value,
			biography: event.target.biography.value,
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

		console.log("Profile Settings: ", ProfileSettings)
	}

	const imageStyle = {
		display: 'relative',
		marginLeft: 'calc(50% + 5px)',
		transform: 'translate(-50%)',
		filter: 'drop-shadow(0px 0px 3px rgb(241 25 38 / 0.8))',
	}

	const [age, setAge] = useState('');
	const [sexual_pref, setSexpref] = useState('bisexual');

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
					<TextField fullWidth margin='normal' name="location" label='Location'
						placeholder="Location" sx={{ mb: 2 }} required></TextField>
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

const ProfileInput = ({ text, input }) => {
	return (
		<Grid item xs={12} sm={6} sx={{ display: 'inline' }}>
			<Typography sx={{ width: 170, display: 'inline-block', fontWeight: '700' }}>
				{text}
			</Typography>
			<Typography sx={{ width: 'fit-content', display: 'inline' }}>
				{input}
			</Typography>
		</Grid>
	)
}

const Profile = () => {
	const [isLoading, setLoading] = useState(true);
	const dispatch = useDispatch()

	useEffect(() => {
		const getData = async () => {
			await dispatch(getProfileData())
			setLoading(false);
		}
		getData()
	}, [dispatch])

	const profilePicture = {
		width: '100%',
		aspectRatio: '1/1',
		borderRadius: '50%',
		objectFit: 'cover',
	}

	const profileData = useSelector(state => state.profile)

	if (isLoading) {
		return <Loader />
	}

	// console.log(profileData.profile_pic['picture_data'])
	const profile_pic = profileData.profile_pic['picture_data']
	// const profile_pic = require('../images/demo_profilepic.jpeg')
	const other_pictures = profileData.other_pictures
	// console.log(other_pictures)

	const ProfileData = {
		'First name:': profileData.firstname,
		'Email address:': profileData.email,
		'Last name:': profileData.lastname,
		'Gender:': profileData.gender,
		'Age:': profileData.age,
		'Sexual preference:': profileData.sexual_pref,
		'Location:': profileData.user_location
	}

	const deleteImage = (id) => {
		console.log("Deleted image: ", id)
	}

	const handleImageUpload = async (event) => {
		const image = event.target.files[0]

		let formData = new FormData()
		formData.append('file', image)
		await profileService.uploadPicture(formData)
		dispatch(getProfileData())
		event.target.value = ''
	}

	if (!profileData.id) {
		return <ProfileSetUpForm />
	} else {
		return (
			<Container maxWidth='md' sx={{ pt: 5, pb: 5 }}>
				<Paper elevation={10} sx={{ padding: 3 }}>
					<Grid sx={{
						display: 'flex',
						alignContent: 'center',
						alignItems: 'center',
						justifyContent: 'center',
						mb: 2,
					}}>
						<Box sx={{ width: '200px', display: 'inline-block' }}>
							<img
								src={profile_pic}
								alt='profile'
								style={profilePicture}
							/>
						</Box>
						<Box sx={{ width: 'fit-content', ml: 5 }}>
							<Typography variant='h2' align='center'>
								{profileData.username}
							</Typography>
							<Typography variant='h5'>Fame Rating: {profileData.fame_rating}</Typography>
							<StyledRating
								name="read-only"
								value={3.453}
								precision={0.5}
								icon={<FavoriteIcon fontSize="inherit" />}
								emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
								readOnly
							/>
						</Box>
					</Grid>
					<Grid container spacing={1} direction="row" sx={{ mb: 2 }}>
						{Object.keys(ProfileData).map((key, index) => {
							return <ProfileInput key={index} text={key} input={ProfileData[key]} />
						})}
					</Grid>
					<Grid container sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
						<Typography sx={{ width: 'fit-content', fontWeight: '700' }}>
							{"Biography: "}
						</Typography>
						<Grid item xs={12} sm={10}>
							<Typography sx={{ width: 'fit-content' }}>
								{profileData.biography}
							</Typography>
						</Grid>
					</Grid>
					<Button theme={theme}>Edit profile</Button>
					<Button theme={theme}>Change password</Button>
					<Button theme={theme}>
						<label htmlFor="image-upload" className="styled-image-upload">
							Change profile picture
							<input type="file" name="file" id="image-upload" accept="image/jpeg, image/png, image/jpg" onChange={handleImageUpload}></input>
						</label>
					</Button>
					<div id="other_pictures">
						{other_pictures.map((picture, i) =>
							<div key={i}>
								<label htmlFor="image-upload" className="styled-image-upload">
									<img key={picture.picture_id} alt="random_picture" height="100px" src={picture.picture_data}></img>
								</label>
								<input key={picture.picture_id} type="file" name="file" id="image-upload" accept="image/jpeg, image/png, image/jpg"
									onChange={(event, picture) => {
										event.preventDefault()
										deleteImage(picture.picture_id)
										handleImageUpload()
									}}></input>
							</div>
						)}
					</div>
				</Paper>
			</Container>
		)
	}
}

export default Profile
