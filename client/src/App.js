import { useState, useEffect } from 'react'
import {
	BrowserRouter as Router,
	Routes, Route
	// useParams, useNavigate
} from 'react-router-dom'
import signUpService from './services/signUpService'
import Login from './components/Login'
import Signup from './components/Signup'
import Phonebook from './components/Phonebook'
import NavBar from './components/Navbar'

const MainContainer = ({ setUser }) => {
	return (
		<h2>page coming soon...</h2>
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
