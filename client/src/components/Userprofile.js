import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
	Typography, Paper, Box, Grid, Rating, styled, Button, createTheme
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { Container } from '@mui/system'
import browsingService from '../services/browsingService'
import Loader from './Loader'

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
	const [likedUsers, setLikedUsers] = useState([])
	const [connectedUsers, setConnectedUsers] = useState([])
	const [userData, setUserData] = useState([])
	const params = useParams()

	console.log(connectedUsers)
	console.log(likedUsers)
	console.log(params.id)

	useEffect(() => {
		const getData = async () => {
			const userProfile = await browsingService.getUserProfile(params.id)
			setUserData(userProfile)
			const likedUsersList = await browsingService.getLikedUsers()
			setLikedUsers(likedUsersList)
			const connectedUsersList = await browsingService.getConnectedUsers()
			setConnectedUsers(connectedUsersList)
			setLoading(false)
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
		'Email address:': userData.email,
		'Last name:': userData.lastname,
		'Gender:': userData.gender,
		'Age:': userData.age,
		'Sexual preference:': userData.sexual_pref,
		'Location:': userData.user_location,
		'Tags:': userData.tags.map(tag => tag + ', ')
	}

	const likeUser = async (user_id) => {
		browsingService.likeUser(user_id).then((response) => {
			console.log(response)
		})
	}

	const unlikeUser = async (user_id) => {
		browsingService.unlikeUser(user_id).then((response) => {
			console.log(response)
		})
	}

	var likeButton
	if (connectedUsers.includes(Number(params.id))) {
		likeButton = <div><Button theme={themeunlike} onClick={() => { unlikeUser(params.id) }}>Unlike user</Button><Button>Connected</Button></div>
	} else if (likedUsers.includes(Number(params.id))) {
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
						<img
							src={profile_pic}
							alt='profile'
							style={profilePicture}
						/>
					</Box>
					<Box sx={{ width: 'fit-content', ml: 5 }}>
						<Typography variant='h2' align='center'>
							{userData.username}
						</Typography>
						<Typography variant='h5'>Fame Rating: {userData.fame_rating}</Typography>
						<StyledRating
							name="read-only"
							value={3.453}
							precision={0.5}
							icon={<FavoriteIcon fontSize="inherit" />}
							emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
							readOnly
						/>
						{likeButton}
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
		</Container>
	)
}

export default UserProfile
