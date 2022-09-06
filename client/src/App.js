import { useState, useEffect } from 'react'
import signUpService from './services/signUpService'
import Login from './components/Login'
import Signup from './components/Signup'
import Phonebook from './components/Phonebook'

const MainContainer = ({ windowState, setUser }) => {
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
			<button onClick={() => setWindowState('chat')}>Chat</button>
			<button onClick={() => setWindowState('phonebook')}>Phonebook</button>
		</>
	)
}

const NavBar = ({ user, setUser, setWindowState }) => {
	const logOut = () => {
		signUpService.logOutUser()
		setUser("")
	}

	return (
		<>
			<p>User: {user} <button onClick={() => logOut()}>logout</button></p>
			<Buttons setWindowState={setWindowState} />
		</>
	)
}

const App = () => {
	const [windowState, setWindowState] = useState('phonebook')
	const [user, setUser] = useState("")

	useEffect(() => {
		signUpService
			.sessionUser()
			.then(result => {
				setUser(result)
			})
	}, [user])

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(position => {
			console.log(position.coords.latitude);
			console.log(position.coords.longitude);
		});
	}

	if (windowState === 'phonebook') {
		return (
			<div>
				<NavBar user={user} setUser={setUser} setWindowState={setWindowState} />
				<Phonebook />
			</div>
		)
	}

	if (windowState === 'login') {
		return (
			<div>
				<NavBar user={user} setUser={setUser} setWindowState={setWindowState} />
				<Login setUser={setUser}/>
			</div>
		)
	}

	if (windowState === 'signup') {
		return (
			<div>
				<NavBar user={user} setUser={setUser} setWindowState={setWindowState} />
				<Signup />
			</div>
		)
	}

	return (
		<div>
			<NavBar user={user} setUser={setUser} setWindowState={setWindowState} />
			<MainContainer windowState={windowState} setUser={setUser} />
		</div>
	)
}

export default App