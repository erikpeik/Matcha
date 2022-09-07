import { useState, useEffect } from 'react'
import {
	BrowserRouter as Router,
	Routes, Route, Link,
	// useParams, useNavigate
} from 'react-router-dom'
import signUpService from './services/signUpService'
import Login from './components/Login'
import Signup from './components/Signup'
import Phonebook from './components/Phonebook'

const MainContainer = ({ setUser }) => {
	return (
		<h2>page coming soon...</h2>
	)
}

const Buttons = () => {
	return (
		<div>
			<Link to="/login"><button>login</button></Link>
			<Link to="/signup"><button>signup</button></Link>
			<Link to="/profile"><button>profile</button></Link>
			<Link to="/browse_users"><button>browse users</button></Link>
			<Link to="/chat"><button>chat</button></Link>
			<Link to="/phonebook"><button>phonebook</button></Link>
		</div>
	)
}

const NavBar = ({ user, setUser }) => {
	const logOut = () => {
		signUpService.logOutUser()
		setUser("")
	}

	return (
		<>
			<p>User: {user} <button onClick={() => logOut()}>logout</button></p>
			<Buttons />
		</>
	)
}

const App = () => {
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

	return (
		<Router>
			<NavBar user={user} setUser={setUser} />
			<Routes>
				<Route path="/" element={<Login setUser={setUser} />} />
				<Route path="/login" element={<Login setUser={setUser} />} />
				<Route path="/signup" element={<Signup setUser={setUser} />} />
				<Route path="/profile" element={<MainContainer setUser={setUser} />} />
				<Route path="/browse_users" element={<MainContainer setUser={setUser} />} />
				<Route path="/chat" element={<MainContainer setUser={setUser} />} />
				<Route path="/phonebook" element={<Phonebook />} />
			</Routes>
		</Router>
	)
}

export default App