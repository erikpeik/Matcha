import { useEffect } from "react"
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { changeNotification } from '../../reducers/notificationReducer'
import { changeSeverity } from '../../reducers/severityReducer'
import Notification from '../Notification'
import { Button, Paper, TextField, Typography } from "@mui/material";
import { Container } from '@mui/system';
import { createTheme } from '@mui/material/styles'
import { ReactComponent as HeartIcon } from '../../images/matcha_icon_with_heart.svg'
import profileService from "../../services/profileService"

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

const ChangePassword = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()

	const user = useSelector(state => state.user)

	useEffect(() => {
		if (user === undefined || user === '') {
			navigate('/login')
		}
	}, [user, navigate])

	const submitPasswords = async (event) => {
		event.preventDefault()

		const passWords = {
			oldPassword: event.target.old_password.value,
			newPassword: event.target.new_password.value,
			confirmPassword: event.target.confirm_password.value
		}

		profileService.changePassword(passWords).then(result => {
			if (result === true) {
				dispatch(changeSeverity('success'))
				dispatch(changeNotification('New password created successfully!'))
				navigate('/profile')
			} else {
				dispatch(changeSeverity('error'))
				dispatch(changeNotification(result))
			}
		})
	}

	return (
		<Container maxWidth='sm' sx={{ pt: 5, pb: 5 }}>
			<Paper elevation={10} sx={{ padding: 3 }}>
				<HeartIcon style={imageStyle} />
				<Typography variant='h5' align='center'
					sx={{ fontWeight: 550 }}>Change password</Typography>
				<Typography align='center'>Please confirm your old password to make a new one.</Typography>
				<form onSubmit={submitPasswords}>
					<TextField type='password' fullWidth margin='dense' name="old_password"
						label='Old Password' placeholder="Old password" required></TextField>
					<TextField type='password' fullWidth margin='dense' name="new_password"
						label='New Password' placeholder="New password" required></TextField>
					<TextField type='password' fullWidth margin='dense' name="confirm_password"
						label='Confirm new password' placeholder="Confirm new password" required></TextField>
					<Button type="submit" variant='contained' theme={theme} size='large' sx={{ mt: 1 }}>Submit</Button>
				</form>
				<Notification />
			</Paper>
		</Container>
	)
}

export default ChangePassword
