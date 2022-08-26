import { useState } from 'react'
import signUpService from './services/signUpService'
import Phonebook from './components/Phonebook'

const MainContainer = ({ windowState }) => {
	const [message, setMessage] = useState("User will soon be created!")

	const submitUser = (event) => {
		event.preventDefault()
		console.log("Sending user data! Or not really...")

		const signedUpUser = {
			username: event.target.username.value,
			firstname: event.target.firstname.value,
			lastname: event.target.lastname.value,
			email: event.target.email.value,
			password: event.target.password.value,
			confirmPassword: event.target.confirm_password.value,
		}

		signUpService.checkUniqueName(signedUpUser).then((result) => {
			if (result === true) {
				signUpService
					.createUser(signedUpUser)
					.then(responseData => {
						setMessage("User created!")
						console.log(responseData)
					})
			}
		})
}

if (windowState === 'signup') {
	return (
		<>
			<h2>{windowState}</h2>
			<form onSubmit={submitUser}>
				<br></br>
				<div><input type="text" name="username" placeholder="Username" autoComplete="off"></input></div>
				<div><input type="text" name="firstname" placeholder="First name" autoComplete="off"></input></div>
				<div><input type="text" name="lastname" placeholder="Last name" autoComplete="off"></input></div>
				<div><input type="email" name="email" placeholder="E-mail" autoComplete="off"></input></div>
				<div><input type="password" name="password" placeholder="Password" autoComplete="off"></input></div>
				<div><input type="password" name="confirm_password" placeholder="Confirm password" autoComplete="off"></input></div>
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

	return (
		<div>
			<Buttons setWindowState={setWindowState} />
			<MainContainer windowState={windowState} />
		</div>
	)
}

export default App