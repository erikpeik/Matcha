import { useSelector, useDispatch } from 'react-redux'
import { setNotification } from '../../reducers/notificationReducer'
import { useParams, useNavigate } from 'react-router-dom'
import signUpService from '../../services/signUpService'
import { Container, Paper, TextField, Typography, Button } from '@mui/material'
import { createTheme } from '@mui/material/styles'
import { IconMailForward } from '@tabler/icons';
import Notification from '../Notification'

const imageStyle = {
	width: '100px',
	display: 'relative',
	marginLeft: 'calc(50% + 5px)',
	transform: 'translate(-50%)',
	filter: 'drop-shadow(0px 0px 3px rgb(241 25 38 / 0.8))',
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

export const SetNewPassword = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const notification = useSelector(state => state.notification)
	const params = useParams()

	const sendNewPassword = (event) => {
		event.preventDefault()

		const passwords = {
			user: params.user,
			code: params.code,
			password: event.target.password.value,
			confirmPassword: event.target.confirm_password.value
		}

		signUpService.setNewPassword(passwords).then(result => {
			if (result === true) {
				dispatch(setNotification("Password successfully changed! Please log in.", 10))
				// console.log(result)
				navigate('/login')
			} else {
				dispatch(setNotification(result, 10))
				console.log(result)
			}
		})
	}

	return (
		<>
			<h2>Set new password</h2>
			<form onSubmit={sendNewPassword}>
				<p>Please enter a new password:</p>
				<br></br>
				<div><input type="password" name="password" placeholder="Password" autoComplete="off" required></input></div>
				<div><input type="password" name="confirm_password" placeholder="Confirm password" autoComplete="off" required></input></div>
				<button type="submit">Reset password</button>
			</form>
			<p>{notification}</p>
		</>
	)
}


const ResetPasswordForm = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()

	const sendPasswordMail = (event) => {
		event.preventDefault()
		console.log("Sending password reset mail!")

		const resetInfo = {
			resetvalue: event.target.reset.value
		}

		signUpService.resetPassword(resetInfo).then((result) => {
			const message = `If an account with these details was found, a reset email was sent.
							Please check your inbox to reset your password.`

			if (result === true) {
				dispatch(setNotification(message, 10))
				console.log(result)
				navigate('/login')
			} else {
				dispatch(setNotification(message, 10))
				console.log(result)
			}
		})
	}

	return (
		<Container maxWidth='sm' sx={{ pt: 5, pb: 5 }}>
			<Paper elevation={10} sx={{ p: 3 }}>
				<IconMailForward size={100} color="#F11926" style={imageStyle} />
				<Typography variant='h5' align='center' sx={{ frontWeight: 550 }}>
					Reset Password
				</Typography>
				<Typography align='center'>
					Please enter either your username or e-mail address to reset your password.
				</Typography>
				<form onSubmit={sendPasswordMail}>
					<TextField fullWidth margin='normal' name='reset' size="30"
						placeholder="Username / Email address"
						label="Username / Email address"
						autoComplete='email' required
					/>
					<Button type="submit" theme={theme} size='large' sx={{ mt: 1 }}>Reset password</Button>
				</form>
				<Notification />
			</Paper>
		</Container>
	)
}

export default ResetPasswordForm
