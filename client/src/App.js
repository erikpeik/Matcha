import { useState } from 'react'
import signUpService from './services/signUpService'
import Phonebook from './components/Phonebook'

const MainContainer = ({ windowState }) => {
	const [message, setMessage] = useState("")

	const submitUser = (event) => {
		event.preventDefault()
		console.log("Logging user data!")

		const signedUpUser = {
			username: event.target.username.value,
			password: event.target.password.value,
		}

		signUpService.logInUser(signedUpUser).then((result) => {
			if (result === true) {
				// signUpService
				// 	.createUser(signedUpUser)
				// 	.then(responseData => {
						setMessage("User found!")
						console.log(result)
					// })
			} else {
				setMessage(result)
				// console.log(result)
			}
		})
	}

	if (windowState === 'login') {
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
	return (
		<h2>{windowState}</h2>
	)
}

const Signup = () => {
	const [message, setMessage] = useState("")

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
						setMessage("User created!")
						console.log(responseData)
					})
			} else {
				setMessage(result)
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
			<p>{message}</p>
		</>
	)

}

const Buttons = ({ setWindowState }) => {
	return (
		<>
			<button onClick={() => setWindowState('login')}>Log in</button>
			<button onClick={() => setWindowState('signup')}>Sign up</button>
			<button onClick={() => setWindowState('profile')}>Profile</button>
			<button onClick={() => setWindowState('browse_users')}>Browse users</button>
			<button onClick={() => setWindowState('browse_users')}>Chat</button>
			<button onClick={() => setWindowState('phonebook')}>Phonebook</button>
		</>
	)
}

const App = () => {
	const [windowState, setWindowState] = useState('phonebook')

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(position => {
			console.log(position.coords.latitude);
			console.log(position.coords.longitude);
		});
	}

	if (windowState === 'phonebook') {
		return (
			<div>
				<Buttons setWindowState={setWindowState} />
				<Phonebook />
			</div>
		)
	}

	if (windowState === 'signup') {
		return (
			<div>
				<Buttons setWindowState={setWindowState} />
				<Signup />
			</div>
		)
	}

	return (
		<div>
			<Buttons setWindowState={setWindowState} />
			<MainContainer windowState={windowState} />
		</div>
	)
}

export default App