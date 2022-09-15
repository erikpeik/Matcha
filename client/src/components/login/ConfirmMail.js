import { setNotification } from '../../reducers/notificationReducer'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import signUpService from '../../services/signUpService'

const ConfirmMail = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()

	const userToVerify = {
		username: useParams().user,
		code: useParams().code
	}

	signUpService.verifyUser(userToVerify).then((result) => {
		if (result === true) {
			dispatch(setNotification("User verified successfully! Please log in.", 10))
		} else {
			dispatch(setNotification("User verifying failed.", 10))
		}
		navigate('/login')
	})
}

export default ConfirmMail