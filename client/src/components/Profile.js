// import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import signUpService from '../services/signUpService'
import { setUser } from '../reducers/userReducer'
import { setNotification } from '../reducers/notificationReducer'

const Profile = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()

	// const user = useSelector(state => state.user)
	const notification = useSelector(state => state.notification)

	// useEffect(() => {
	// 	if (user !== '') {
	// 		navigate('/profile')
	// 	}
	// }, [user, navigate])

	const submitUserInfo = (event) => {
		event.preventDefault()
		console.log("Logging in user!")

		const signedUpUser = {
			gender: event.target.gender.value,
			age: event.target.gender.value,
			location: event.target.gender.value,
			sexual_pref: event.target.sexual_pref.value,
			username: event.target.username.value,
			password: event.target.password.value,
		}

		signUpService.logInUser(signedUpUser).then((result) => {
			if (result.userid) {
				const sessionUser = { user: result.username, id: result.userid }
				dispatch(setUser(sessionUser))
				dispatch(setNotification("User logged in!", 5))
				navigate('/profile')
			} else {
				dispatch(setNotification(result, 5))
			}
		})
	}

	// const navigateToReset = () => {
	// 	navigate('/login/resetpassword')
	// }

	return (
		<>
			<h2>Profile</h2>
			<form onSubmit={submitUserInfo}>
				<p>Please enter some details about you!</p>
				<br></br>
				<div>Gender:
					<select name="gender">
						<option value="Male">Male</option>
						<option value="Female">Female</option>
						<option value="Other">Other</option>
					</select>
				</div>
				<div>Age:
					<input type="number" name="age" placeholder="Age" autoComplete="off" min="18" max="120" required></input>
				</div>
				<div>Location:
					<input type="text" name="location" placeholder="Helsinki, Finland" autoComplete="off" required></input>
				</div>
				<div>
					Sexual preference:
					<select name="sexual_pref">
						<option value="Bisexual" selected="selected">Bisexual</option>
						<option value="Male">Male</option>
						<option value="Female">Female</option>
					</select>
				</div>
				Biography:
				<div><textarea name="biography" placeholder="Short description of you here..." autoComplete="off" required></textarea></div>
				<button type="submit">Save settings</button>
			</form>
			<p>{notification}</p>
		</>
	)

}

export default Profile