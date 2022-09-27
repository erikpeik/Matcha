import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
	BrowserRouter as Router, Routes, Route
} from 'react-router-dom'
import signUpService from './services/signUpService'
import { setUser } from './reducers/userReducer'
import { getProfileData } from './reducers/profileReducer'
import Login from './components/Login'
import Signup from './components/Signup'
import Profile from './components/Profile'
import ProfileSettings from './components/profile/ProfileSettings'
import Browsing from './components/Browsing'
import NavBar from './components/navbar/Navbar'
import Footer from './components/Footer'
import Redirect from './components/Redirect'
import ConfirmMail from './components/login/ConfirmMail'
import Chat from './components/chat/Chat'
import Loader from './components/Loader'
import ResetPassword, { SetNewPassword } from './components/login/ResetPassword'
import Logout from './components/Logout'
import UserProfile from './components/Userprofile'
import { changeOnlineUsers } from './reducers/onlineUsersReducer'
import socketIO from 'socket.io-client';
import "./css/App.css"

const App = () => {
	const [socket, setSocket] = useState(null)
	const [socketConnected, setSocketConnected] = useState(false)
	const dispatch = useDispatch()

	useEffect(() => {
		setSocket(socketIO('http://localhost:3001'))
	}, [])

	useEffect(() => {
		if (!socket) return

		socket.on('connect', () => {
			setSocketConnected(true)
		})
		socket.on('newUserResponse', (data) => {
			dispatch(changeOnlineUsers(data))
		})
	}, [socket, dispatch])

	useEffect(() => {
		dispatch(getProfileData())
		signUpService
			.getSessionUser()
			.then(result => {
				dispatch(setUser(result))
			})
	}, [dispatch])

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(position => {
			console.log(position.coords.latitude)
			console.log(position.coords.longitude)
		});
	}
	if (!socketConnected) return <Loader />
	return <div className='content-wrap'>
		<Router>
			<Redirect />
			<NavBar socket={socket} />
			<Routes>
				<Route path="/" element={<Profile />} />
				<Route path="/login" element={<Login socket={socket} />} />
				<Route path="/login/resetpassword" element={<ResetPassword />} />
				<Route path="/resetpassword/:user/:code" element={<SetNewPassword />} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/settings" element={<ProfileSettings />} />
				<Route path="/confirm/:user/:code" element={<ConfirmMail />} />
				<Route path="/profile" element={<Profile />} />
				<Route path="/userprofile/:id" element={<UserProfile />} />
				<Route path="/browsing" element={<Browsing />} />
				<Route path="/chat" element={<Chat socket={socket} />} />
				<Route path="/logout" element={<Logout socket={socket} />} />
			</Routes>
		</Router>
		<Footer />
	</div>
}

export default App
