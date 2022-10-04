import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
	Typography, Paper, Box, Grid, Rating, styled, Button, createTheme, Avatar
} from '@mui/material'
import AspectRatio from '@mui/joy/AspectRatio'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { Container } from '@mui/system'
import browsingService from '../services/browsingService'
import { getUserLists } from '../reducers/userListsReducer'
import Notification from './Notification'
import Loader from './Loader'
import { changeSeverity } from '../reducers/severityReducer'
import { changeNotification } from '../reducers/notificationReducer'

const themelike = createTheme({
	palette: {
		primary: {
			main: '#4CBB17',
		},
		secondary: {
			main: '#F5F5F5',
		},
	}
})

const themeunlike = createTheme({
	palette: {
		primary: {
			main: '#FF1E56',
		},
		secondary: {
			main: '#F5F5F5',
		},
	}
})

const StyledRating = styled(Rating)({
	'& .MuiRating-iconFilled': {
		color: '#ff6d75',
	},
	'& .MuiRating-iconHover': {
		color: '#ff3d47',
	},
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

const UserProfile = () => {
	const [isLoading, setLoading] = useState(true);
	const dispatch = useDispatch()
	const userLists = useSelector(state => state.userLists)
	const [userData, setUserData] = useState([])
	const params = useParams()

	useEffect(() => {
		const getData = async () => {
			const userProfile = await browsingService.getUserProfile(params.id)
			setUserData(userProfile)
			setLoading(false)
			dispatch(changeNotification(''))
		}
		getData()
	}, [params, dispatch])

	const profilePicture = {
		width: '100%',
		aspectRatio: '1/1',
		borderRadius: '50%',
		objectFit: 'cover',
	}

	if (isLoading) {
		return <Loader />
	}

	const profile_pic = userData.profile_pic['picture_data']
	const other_pictures = userData.other_pictures

	const ProfileData = {
		'First name:': userData.firstname,
		'Last name:': userData.lastname,
		'Gender:': userData.gender,
		'Age:': userData.age,
		'Sexual preference:': userData.sexual_pref,
		'Location:': userData.user_location,
		'Tags:': userData.tags.map(tag => tag + ', ')
	}

	const likeUser = async (user_id) => {
		const result = await browsingService.likeUser(user_id)
		if (result === 'No profile picture') {
			dispatch(changeSeverity('error'))
			dispatch(changeNotification('You must set a profile picture before you can like other users.'))
		} else {
			dispatch(getUserLists())
		}
	}

	const unlikeUser = async (user_id) => {
		await browsingService.unlikeUser(user_id)
		dispatch(getUserLists())
	}

	const blockUser = async (user_id) => {
		await browsingService.blockUser(user_id)
		dispatch(changeSeverity('success'))
		dispatch(changeNotification(`This user has been blocked and will not show up in your search results.
		Neither can they see you or like you anymore.`))
		dispatch(getUserLists())
	}

	const reportUser = async (user_id) => {
		const result = await browsingService.reportUser(user_id)
		if (result === 'Reported user!') {
			dispatch(changeSeverity('success'))
			dispatch(changeNotification(`The user has been reported as a fake account.
						Our admin will deal with the matter as soon as possible.`))
		} else {
			dispatch(changeSeverity('error'))
			dispatch(changeNotification(result))
		}
	}

	var likeButton
	if (userLists.connected.includes(Number(params.id))) {
		likeButton = <div><Button theme={themeunlike} onClick={() => { unlikeUser(params.id) }}>Unlike user</Button><Button>Connected</Button></div>
	} else if (userLists.liked.includes(Number(params.id))) {
		likeButton = <Button theme={themeunlike} onClick={() => { unlikeUser(params.id) }}>Unlike user</Button>
	} else {
		likeButton = <Button theme={themelike} onClick={() => { likeUser(params.id) }}>Like user</Button>
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
						<Typography variant='h2' align='center'>
							{userData.username}
						</Typography>
						<Typography variant='h5'>Fame Rating: {userData.total_pts}</Typography>
						<StyledRating
							name="read-only"
							value={userData.total_pts / 20}
							precision={0.5}
							icon={<FavoriteIcon fontSize="inherit" />}
							emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
							readOnly
						/>
						<Box>
							{likeButton}
							<Button theme={themeunlike} onClick={() => { blockUser(params.id) }}>Block user</Button>
							<Button theme={themeunlike} onClick={() => { reportUser(params.id) }}>Report as fake account</Button>
						</Box>
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
							{userData.biography}
						</Typography>
					</Grid>
				</Grid>
				<div id="other_pictures">
					{other_pictures.map((picture, i) =>
						<img key={picture.picture_id} alt="random_picture" height="100px" src={picture.picture_data}></img>
					)}
				</div>
			</Paper>
			<Notification />
		</Container>
	)
}

export default UserProfile
