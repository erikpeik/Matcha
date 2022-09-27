import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import {
	Typography, Paper, Box, Grid, Rating, styled
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { Container } from '@mui/system'
import { getProfileData } from '../reducers/profileReducer'
import Loader from './Loader'

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
	const navigate = useNavigate()
	const profileData = useSelector(state => state.profile)
	const params = useParams()

	console.log(params.id)

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

	const profile_pic = profileData.profile_pic['picture_data']
	const other_pictures = profileData.other_pictures

	const ProfileData = {
		'First name:': profileData.firstname,
		'Email address:': profileData.email,
		'Last name:': profileData.lastname,
		'Gender:': profileData.gender,
		'Age:': profileData.age,
		'Sexual preference:': profileData.sexual_pref,
		'Location:': profileData.user_location,
		'Tags:': profileData.tags.map(tag => tag + ', ')
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
