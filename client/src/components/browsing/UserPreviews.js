import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button, createTheme } from '@mui/material'
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

const UserPreviews = ({ pageUsers, searchCriteria }) => {
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
		dispatch(setBrowsingCriteria({ ...searchCriteria }))
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
				return (<div key={`profile_container${user.id}`} id="profile_container">
					<div key={`picture_container${user.id}`} id="picture_container">
						<img key={user.id} alt="profile_picture" src={user.profile_pic} className="userprofilepic"
							onClick={() => navigate(`/userprofile/${user.id}`)} height="200px"></img>
					</div>
					<div key={`profile_data${user.id}`} id="profile_data">
						<h1>{user.username}</h1>
						<h3>Fame rating: {user.fame_rating}</h3>
						<br></br>
						<p>First name: {user.firstname}</p>
						<p>Last name: {user.lastname}</p>
						<p>Gender: {user.gender}</p>
						<p>Age: {user.age}</p>
						<p>Sexual preference: {user.sexual_pref}</p>
						<p>Location: {user.user_location}</p>
						<p>Distance: {Math.floor(user.distance)} km</p>
						<p>Biography: {user.biography}</p>
						<p>Common tags: {user.common_tags}</p>
						{button}
						<Button theme={themeunlike} onClick={() => { blockUser(user.id) }}>Block user</Button>
					</div>
				</div>
				)
		}
		))
}

export default UserPreviews
