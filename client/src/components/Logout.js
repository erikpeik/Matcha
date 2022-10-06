import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { changeNotification } from '../reducers/notificationReducer'
import { changeSeverity } from '../reducers/severityReducer'
import signUpService from '../services/signUpService'
import { setUser } from '../reducers/userReducer'
import { resetProfileData } from '../reducers/profileReducer'
import { resetUserLists } from '../reducers/userListsReducer'
import { resetBrowsingCriteria } from '../reducers/browsingReducer'
import { resetDisplaySettings } from '../reducers/displaySettingsReducer'
import { resetUserNotifications } from '../reducers/userNotificationsReducer'

const Logout = ({ socket }) => {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const notification = useSelector((state => state.notification))

	useEffect(() => {
		signUpService.logOutUser()
		dispatch(setUser(""))
		dispatch(resetUserLists())
		dispatch(resetUserNotifications())
		dispatch(resetBrowsingCriteria())
		dispatch(resetDisplaySettings())
		dispatch(resetProfileData())
		dispatch(changeSeverity('success'))
		if (notification !== "User has been successfully deleted. Bye bye!")
			dispatch(changeNotification("Logged out. Thank you for using Matcha!"))
		socket.emit("logOut", { socketID: socket.id })
		navigate('/login')
	}, [dispatch, navigate, socket, notification])
}

export default Logout
