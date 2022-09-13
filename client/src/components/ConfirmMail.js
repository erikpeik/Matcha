// import { useSelector, useDispatch } from 'react-redux'
// import signUpService from '../services/signUpService'
// import { setUser } from '../reducers/userReducer'
// import { setNotification } from '../reducers/notificationReducer'
import {
	// BrowserRouter as Router,
	// Routes, Route
	useParams,
	useNavigate
} from 'react-router-dom'

const ConfirmMail = () => {
	console.log("User: " + useParams().user)
	console.log("Code: " + useParams().code)
	useNavigate('/')
}

export default ConfirmMail