import { useSelector, useDispatch } from 'react-redux'
import { setNotification } from '../reducers/notificationReducer'
import signUpService from '../services/signUpService'

const Signup = () => {
	const dispatch = useDispatch()

	const notification = useSelector(state => state.notification)

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
						dispatch(setNotification("User created!", 5))
						console.log(responseData)
					})
			} else {
				dispatch(setNotification(result, 5))
				// console.log(result)
			}
		})
	}

	return (
		<>
			<h2>Signup</h2>
			<form onSubmit={submitUser}>
				<br></br>
				<div><input type="text" name="username" placeholder="Username" autoComplete="off" required></input></div>
				<div><input type="text" name="firstname" placeholder="First name" autoComplete="off" required></input></div>
				<div><input type="text" name="lastname" placeholder="Last name" autoComplete="off" required></input></div>
				<div><input type="email" name="email" placeholder="E-mail" autoComplete="off" required></input></div>
				<div><input type="password" name="password" placeholder="Password" autoComplete="off" required></input></div>
				<div><input type="password" name="confirm_password" placeholder="Confirm password" autoComplete="off" required></input></div>
				<button type="submit">Submit</button>
			</form>
			<p>{notification}</p>
		</>
	)

}

export default Signup