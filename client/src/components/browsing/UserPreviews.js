import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
	Button, createTheme, Paper, Avatar, Box, Typography,
	Table, TableBody, TableRow, TableCell, Grid
} from '@mui/material'
import AspectRatio from '@mui/joy/AspectRatio';
import browsingService from '../../services/browsingService'
import { setBrowsingCriteria } from '../../reducers/browsingReducer'
import { getUserLists } from '../../reducers/userListsReducer'
import { changeNotification } from '../../reducers/notificationReducer'
import { changeSeverity } from '../../reducers/severityReducer'

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

const UserPreviews = ({ pageUsers, browsingCriteria }) => {
	const userLists = useSelector(state => state.userLists)
	const navigate = useNavigate()
	const dispatch = useDispatch()

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
		dispatch(getUserLists())
		dispatch(setBrowsingCriteria({ ...browsingCriteria }))
	}

	const createData = (name, value) => {
		return { name, value }
	}

	return (
		pageUsers.map(user => {
			var button
			if (userLists.connected.includes(user.id)) {
				button = <div><Button theme={themeunlike} onClick={() => { unlikeUser(user.id) }}>Unlike user</Button><Button>Connected</Button></div>
			} else if (userLists.liked.includes(user.id)) {
				button = <Button theme={themeunlike} onClick={() => { unlikeUser(user.id) }}>Unlike user</Button>
			} else {
				button = <Button theme={themelike} onClick={() => { likeUser(user.id) }}>Like user</Button>
			}
			if (!user.id) {
				return (<div key="emptyusers"></div>)
			} else
				var rows = [
					createData('Name', `${user.firstname} ${user.lastname}`),
					createData('Fame rating', user.fame_rating),
					createData('Gender', user.gender),
					createData('Age', user.age),
					createData('Sexual preference', user.sexual_pref),
					createData('Location', user.user_location),
					createData('Distance', `${Math.floor(user.distance)} km`),
					createData('Common tags', user.common_tags)
				]
			return (
				<Paper key={`profile_container${user.id}`} sx={{ mb: 1 }} >
					<Grid container display='flex' sx={{ alignItems: 'center' }}>
						<Grid item xs={4} sx={{ paddingTop: 0 }}>
							<Box sx={{ padding: 1 }}>
								<AspectRatio
									component={Paper}
									elevation={3}
									ratio='1'
								>
									<Avatar
										variant="rounded"
										key={user.id}
										alt="profile_picture"
										src={user.profile_pic}
										onClick={() => navigate(`/userprofile/${user.id}`)}
										sx={{ width: '100%', cursor: 'pointer' }}
									/>
								</AspectRatio>
							</Box>
						</Grid>
						<Grid item xs={6}>
							<Box key={`profile_data${user.id}`}>
								<Typography variant='h2'>{user.username}</Typography>
								<Table>
									<TableBody>
										{rows.map((row) => (
											<TableRow
												key={row.name}
												sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
											>
												<TableCell component="th" scope="row">
													{row.name}
												</TableCell>
												<TableCell align="right">{row.value}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
								{button}
								<Button theme={themeunlike} onClick={() => { blockUser(user.id) }}>Block user</Button>
							</Box>
						</Grid>
					</Grid>
				</Paper>
			)
		}
		))
}

export default UserPreviews
