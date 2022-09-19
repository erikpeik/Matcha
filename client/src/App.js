import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
	BrowserRouter as Router,
	Routes, Route, useNavigate
} from 'react-router-dom'
import signUpService from './services/signUpService'
import { setUser } from './reducers/userReducer'
import { getProfileData } from './reducers/profileReducer'
import Login from './components/Login'
import Signup from './components/Signup'
import Profile from './components/Profile'
import Browsing from './components/Browsing'
import NavBar from './components/Navbar'
import Footer from './components/Footer'
import ConfirmMail from './components/login/ConfirmMail'
import ResetPassword, {SetNewPassword} from './components/login/ResetPassword'
import CheckLocation from './components/CheckLocation'
import "./css/App.css"

const MainContainer = () => {
	return (
		<h2>page coming soon...</h2>
	)
}

const Logout = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()

	useEffect(() => {
		signUpService.logOutUser()
		dispatch(setUser(""))
		dispatch(getProfileData())
		navigate('/login')
	}, [dispatch, navigate])
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

	return <div className='content-wrap'>
		<Router>
			<CheckLocation />
			<NavBar />
			<Routes>
				<Route path="/" element={<Login />} />
				<Route path="/login" element={<Login />} />
				<Route path="/login/resetpassword" element={<ResetPassword />} />
				<Route path="/resetpassword/:user/:code" element={<SetNewPassword />} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/confirm/:user/:code" element={<ConfirmMail />} />
				<Route path="/profile" element={<Profile />} />
				<Route path="/browsing" element={<Browsing />} />
				<Route path="/chat" element={<MainContainer />} />
				<Route path="/logout" element={<Logout />} />
			</Routes>
		</Router>
		<Footer />
	</div>
}

export default App
