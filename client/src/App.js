import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
	BrowserRouter as Router,
	Routes, Route
	// useParams, useNavigate
} from 'react-router-dom'
import signUpService from './services/signUpService'
import { setUser } from './reducers/userReducer'
import Login from './components/Login'
import Signup from './components/Signup'
import NavBar from './components/Navbar'

const MainContainer = () => {
	return (
		<h2>page coming soon...</h2>
	)
}

const Logout = () => {
	signUpService.logOutUser()
	setUser("")
	console.log("logged out")
}


const App = () => {
	const dispatch = useDispatch()

	useEffect(() => {
		signUpService
			.getSessionUser()
			.then(result => {
				dispatch(setUser(result))
			})
	}, [dispatch])

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(position => {
			console.log(position.coords.latitude);
			console.log(position.coords.longitude);
		});
	}

	return (
		<Router>
			<NavBar />
			<Routes>
				<Route path="/" element={<Login />} />
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/profile" element={<MainContainer />} />
				<Route path="/browse_users" element={<MainContainer />} />
				<Route path="/chat" element={<MainContainer />} />
				<Route path="/logout" element={<Logout /> } />
			</Routes>
		</Router>
	)
}

export default App
