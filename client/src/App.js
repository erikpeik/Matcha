import { useEffect, useState } from 'react'
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
import ProfileSettings from './components/profile/ProfileSettings'
import Browsing from './components/Browsing'
import NavBar from './components/Navbar'
import Footer from './components/Footer'
import Redirect from './components/Redirect'
import ConfirmMail from './components/login/ConfirmMail'
import Chat from './components/chat/Chat'
import Loader from './components/Loader'
import ResetPassword, { SetNewPassword } from './components/login/ResetPassword'
import { changeNotification } from './reducers/notificationReducer'
import { changeSeverity } from './reducers/severityReducer'
import { changeOnlineUsers } from './reducers/onlineUsersReducer'
import "./css/App.css"

import socketIO from 'socket.io-client';


const Logout = ({ socket }) => {
	const dispatch = useDispatch()
	const navigate = useNavigate()

	useEffect(() => {
		signUpService.logOutUser()
		dispatch(setUser(""))
		dispatch(getProfileData())
		dispatch(changeSeverity('success'))
		dispatch(changeNotification("Logged out. Thank you for using Matcha!"))
		socket.emit("logOut", {socketID: socket.id})
		navigate('/login')
	}, [dispatch, navigate, socket])
}

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
	}, [socket])

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
				<Route path="/browsing" element={<Browsing />} />
				<Route path="/chat" element={<Chat socket={socket} />} />
				<Route path="/logout" element={<Logout socket={socket} />} />
			</Routes>
		</Router>
		<Footer />
	</div>
}

export default App
