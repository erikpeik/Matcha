import { useSelector, useDispatch } from 'react-redux'
import { setNotification } from '../../reducers/notificationReducer'
import { useParams, useNavigate } from 'react-router-dom'
import signUpService from '../../services/signUpService'

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

	const notification = useSelector(state => state.notification)

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
		<>
			<h2>Reset password</h2>
			<form onSubmit={sendPasswordMail}>
				<p>Please enter either your username or e-mail address to reset your password.</p>
				<br></br>
				<div><input type="text" name="reset" placeholder="Username / Email address" size="30" autoComplete="off" required></input></div>
				<button type="submit">Reset password</button>
			</form>
			<p>{notification}</p>
		</>
	)

}

export default ResetPasswordForm