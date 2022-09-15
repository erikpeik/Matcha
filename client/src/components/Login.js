import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import signUpService from '../services/signUpService'
import { setUser } from '../reducers/userReducer'
import { setNotification } from '../reducers/notificationReducer'

const Login = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()

	const user = useSelector(state => state.user)
	const notification = useSelector(state => state.notification)

	useEffect(() => {
		if (user !== '') {
			navigate('/profile')
		}
	}, [user, navigate])

	const submitUser = (event) => {
		event.preventDefault()
		console.log("Logging in user!")

		const signedUpUser = {
			username: event.target.username.value,
			password: event.target.password.value,
		}

		signUpService.logInUser(signedUpUser).then((result) => {
			if (result.userid) {
				const sessionUser = {user: result.username, id: result.userid}
				dispatch(setUser(sessionUser))
				dispatch(setNotification("User logged in!", 5))
				navigate('/profile')
			} else {
				dispatch(setNotification(result, 5))
				// console.log(result)
			}
		})
	}

	return (
		<>
			<h2>Login</h2>
			<form onSubmit={submitUser}>
				<br></br>
				<div><input type="text" name="username" placeholder="Username" autoComplete="off" required></input></div>
				<div><input type="password" name="password" placeholder="Password" autoComplete="off" required></input></div>
				<button type="submit">Submit</button>
			</form>
			<p>{notification}</p>
		</>
	)

}

export default Login