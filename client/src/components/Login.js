import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import signUpService from '../services/signUpService'
import { setUser } from '../reducers/userReducer'
import { changeNotification } from '../reducers/notificationReducer'
import { changeSeverity } from '../reducers/severityReducer'
import { getProfileData } from '../reducers/profileReducer'
import { getUserLists } from '../reducers/userListsReducer'
import { getUserNotifications } from '../reducers/userNotificationsReducer'
import { Typography, Button, Paper, TextField } from '@mui/material'
import { Container } from '@mui/system';
import { createTheme } from '@mui/material/styles'
import { ReactComponent as HeartIcon } from '../images/matcha_icon_with_heart.svg'
import Notification from './Notification'

const Login = ({ socket }) => {
	const dispatch = useDispatch()
	const navigate = useNavigate()

	const submitUser = async (event) => {
		event.preventDefault()

		const signedUpUser = {
			username: event.target.username.value,
			password: event.target.password.value
		}

		signUpService.logInUser(signedUpUser).then((result) => {
			if (result.userid) {
				const sessionUser = { name: result.username, id: result.userid }
				dispatch(setUser(sessionUser))
				dispatch(getUserLists())
				dispatch(getUserNotifications())
				dispatch(getProfileData())
				dispatch(changeNotification(""))
				socket.emit("newUser", { name: result.username, id: result.userid, socketID: socket.id })
				socket.emit("join_notification", { id: result.userid })
			} else {
				dispatch(changeSeverity('error'))
				dispatch(changeNotification(result))
			}
		})
	}

	const navigateToReset = () => {
		navigate('/login/resetpassword')
	}

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

	const imageStyle = {
		width: '100px',
		display: 'relative',
		marginLeft: 'calc(50% + 5px)',
		transform: 'translate(-50%)',
		filter: 'drop-shadow(0px 0px 3px rgb(241 25 38 / 0.8))',
	}

	return (
		<Container maxWidth='sm' sx={{ pt: 5, pb: 5 }}>
			<Paper elevation={10} sx={{ padding: 3 }}>
				<HeartIcon style={imageStyle} />
				<Typography variant='h5' align='center'
					sx={{ fontWeight: 550 }}>Login</Typography>
				<Typography align='center' xs={{ mb: 4 }}>Login and start dating now!</Typography>
				<form onSubmit={submitUser}>
					<TextField fullWidth margin='normal' name="username" label='Username or e-mail address'
						placeholder="Username or email address" required></TextField>
					<TextField fullWidth margin='dense' type="password" name="password"
						label='Password' placeholder="Password" required></TextField>
					<Button type='submit' variant='contained' theme={theme} size='large' sx={{ mt: 1 }}>Submit</Button>
				</form>
				<Button onClick={navigateToReset} sx={{ mt: 1 }}>Forgot password?</Button>
				<Notification />
			</Paper>
		</Container>
	)
}

export default Login
