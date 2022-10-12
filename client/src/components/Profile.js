import { useState, useEffect } from 'react'
import { changeNotification } from '../reducers/notificationReducer'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import {
	Typography, Button, Paper, createTheme, Box, Grid, Rating, styled, Avatar
} from '@mui/material'
import AspectRatio from '@mui/joy/AspectRatio'
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
		}
	}
})

const deleteTheme = createTheme({
	palette: {
		primary: {
			main: '#FF0000',
		}
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
		return <Loader text="Getting profile data..." />
	}
	if (!profileData.id) {
		return <ProfileSetUpForm />
	}

	const profile_pic = profileData.profile_pic['picture_data']
	const other_pictures = profileData.other_pictures

	const ProfileData = {
		'First name:': profileData.firstname,
		'Last name:': profileData.lastname,
		'Email address:': profileData.email,
		'Gender:': profileData.gender,
		'Age:': profileData.age,
		'Sexual preference:': profileData.sexual_pref,
		'Location:': profileData.user_location,
		'GPS:': Object.values(profileData.ip_location).map((value, i) => ((i ? ', ' : '') + value)),
		'Tags:': profileData.tags.map((tag, i) => ((i ? ', ' : '') + tag)),
		'Users you have liked:': profileData.liked.map((liked, i) => {
			return (
				<Typography key={i}
					component={Link} to={`/profile/${liked.target_id}`}>
					{(i ? ', ' : '') + liked.username}
				</Typography>)
		}),
		'Users who liked you:': profileData.likers.map((liker, i) => {
			return (
				<Typography key={i}
					component={Link} to={`/profile/${liker.liker_id}`}>
					{(i ? ', ' : '') + liker.username}
				</Typography>)
		}),
		'Users who watched your profile:': profileData.watchers.map((watcher, i) => {
			return (
				<Typography key={i}
					component={Link} to={`/profile/${watcher.watcher_id}`}>
					{(i ? ', ' : '') + watcher.username}
				</Typography>)
		})
	}

	const deleteImage = async (id) => {
		if (window.confirm("Are you sure you want to delete this beautiful picture?")) {
			await profileService.deletePicture(id)
			dispatch(getProfileData())
		}
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

	const deleteUser = () => {
		if (window.confirm("Are you sure you want to completely delete your account?")) {
			if (window.confirm("Are you really really sure?")) {
				navigate('/deleteuser')
			}
		}
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
						<AspectRatio ratio={1}>
							<Avatar
								src={profile_pic}
								alt='profile'
								style={profilePicture}
							/>
						</AspectRatio>
					</Box>
					<Box sx={{ width: 'fit-content', ml: 5 }}>
						<Typography variant='h2' sx={{ fontSize: '250%' }}>
							{profileData.username}
						</Typography>
						<Typography variant='h5'>Fame Rating: {profileData.total_pts}</Typography>
						<StyledRating
							name="read-only"
							value={profileData.total_pts / 20}
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
				<Button theme={theme} onClick={() => navigate('/changepassword')}>Change password</Button>
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
				<Button theme={deleteTheme} variant="contained" onClick={() => deleteUser()}>Delete user</Button>
			</Paper>
			<Notification />
		</Container>
	)
}

export default Profile
