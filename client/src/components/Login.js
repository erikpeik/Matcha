import { useState } from 'react'
import signUpService from '../services/signUpService'

const Login = ({ setUser }) => {
	const [message, setMessage] = useState("")

	const submitUser = (event) => {
		event.preventDefault()
		console.log("Logging in user!")

		const signedUpUser = {
			username: event.target.username.value,
			password: event.target.password.value,
		}

		signUpService.logInUser(signedUpUser).then((result) => {
			if (result === true) {
				setUser(result)
				setMessage("Correct password!")
			} else {
				setMessage(result)
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
			<p>{message}</p>
		</>
	)

}

export default Login