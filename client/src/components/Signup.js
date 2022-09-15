import React from "react"
import { useDispatch } from 'react-redux'
import { changeNotification } from '../reducers/notificationReducer'
import { changeSeverity } from '../reducers/severityReducer'
import signUpService from '../services/signUpService'
import Notification from './Notification'
import { Button, Paper, TextField, Typography } from "@mui/material";
import { Container } from '@mui/system';
import { createTheme } from '@mui/material/styles'
import { ReactComponent as HeartIcon } from '../images/matcha_icon_with_heart.svg'

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

const Signup = () => {
	const dispatch = useDispatch()

	const submitUser = (event) => {
		event.preventDefault()
		console.log("Sending user data!")

		const signedUpUser = {
			username: event.target.username.value,
			firstname: event.target.firstname.value,
			lastname: event.target.lastname.value,
			email: event.target.email.value,
			password: event.target.password.value,
			confirmPassword: event.target.confirm_password.value,
		}

		signUpService.checkUserForm(signedUpUser).then((result) => {
			if (result === true) {
				signUpService
					.createUser(signedUpUser)
					.then(responseData => {
						dispatch(changeSeverity('success'))
						dispatch(changeNotification("User created successfully!"))
					})
			} else {
				dispatch(changeSeverity('error'))
				dispatch(changeNotification(result))
			}
		})
	}

	return (
		<Container maxWidth='sm' sx={{ pt: 5, pb: 5 }}>
			<Paper elevation={10} sx={{ padding: 3 }}>
				<HeartIcon width='100px' style={imageStyle} />
				<Typography variant='h5' align='center'
					sx={{ fontWeight: 550 }}>Sign up</Typography>
				<Typography align='center'>Make the first move and create your account</Typography>
				<form onSubmit={submitUser}>
					<TextField fullWidth margin='normal' name="username" label='Username'
						placeholder="Username" autoComplete="username" required></TextField>
					<TextField sx={{ width: '49%', mr: '1%' }} margin='dense' name="firstname"
						label='First name' placeholder="First name" autoComplete="given-name" required></TextField>
					<TextField sx={{ width: '49%', ml: '1%' }} margin='dense' name="lastname"
						label='Last name' placeholder="Last name" autoComplete="family-name" required></TextField>
					<TextField fullWidth margin='dense' name="email" label='E-mail'
						placeholder="E-mail" autoComplete="email" required></TextField>
					<TextField type='password' fullWidth margin='dense' name="password"
						label='Password' placeholder="Password" autoComplete="new-password" required></TextField>
					<TextField type='password' fullWidth margin='dense' name="confirm_password"
						label='Confirm password' placeholder="Confirm password" autoComplete="new-password" required></TextField>
					<Button type="submit" variant='contained' theme={theme} size='large' sx={{ mt: 1 }}>Submit</Button>
				</form>
				<Notification />
			</Paper>
		</Container>
	)
}

export default Signup
