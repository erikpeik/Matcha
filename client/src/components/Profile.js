import { useState, useEffect } from 'react'
import { changeNotification } from '../reducers/notificationReducer'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
	Typography, Button, Paper, createTheme, Box, Grid, Rating, styled
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { Container } from '@mui/system'
import Notification from './Notification'
import { changeSeverity } from '../reducers/severityReducer'
import { getProfileData } from '../reducers/profileReducer'
import profileService from '../services/profileService'
import ProfileSetUpForm from './profile/ProfileSetUpForm'
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
	const navigate = useNavigate()
	const profileData = useSelector(state => state.profile)

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

	if (isLoading) {
		return <Loader />
	}
	if (!profileData.id) {
		return <ProfileSetUpForm />
	}

	// console.log(profileData.profile_pic['picture_data'])
	const profile_pic = profileData.profile_pic['picture_data']
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

	const deleteImage = async (id) => {
		if (window.confirm("Are you sure you want to delete this beautiful picture?")) {
			await profileService.deletePicture(id)
			dispatch(getProfileData())
			console.log("Deleted image: ", id)
		}
	}

	const uploadImage = async (event) => {
		const image = event.target.files[0]

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
		event.target.value = ''
	}

	const setProfilePicture = async (event) => {
		const image = event.target.files[0]

		let formData = new FormData()
		formData.append('file', image)
		await profileService.setProfilePic(formData)
		dispatch(getProfileData())
		dispatch(changeSeverity('success'))
		dispatch(changeNotification("Profile picture set!"))
		event.target.value = ''
	}

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
				<Button theme={theme} onClick={() => navigate('/settings')}>Edit profile</Button>
				<Button theme={theme}>Change password</Button>
				<Button theme={theme}>
					<label htmlFor="set_profilepic" className="styled-image-upload">
						Change profile picture
					</label>
					<input type="file" name="file" id="set_profilepic" accept="image/jpeg, image/png, image/jpg" onChange={setProfilePicture}></input>
				</Button>
				<div id="other_pictures">
					{other_pictures.map((picture, i) =>
						<div key={i}>
							<img key={picture.picture_id} alt="random_picture" height="100px" src={picture.picture_data}></img>
							<Button onClick={() => { deleteImage(picture.picture_id) }} theme={theme}>Delete picture</Button>
						</div>
					)}
				</div>
				<Button theme={theme}>
					<label htmlFor="image-upload" className="styled-image-upload">
						ADD NEW PICTURE
					</label>
					<input type="file" name="file" id="image-upload" accept="image/jpeg, image/png, image/jpg"
						onChange={uploadImage}></input>
				</Button>
			</Paper>
			<Notification />
		</Container>
	)
}

export default Profile
