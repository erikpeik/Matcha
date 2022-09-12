import { useSelector, useDispatch } from 'react-redux'
import signUpService from '../services/signUpService'
import { setUser } from '../reducers/userReducer'

import { Link } from 'react-router-dom'

const Buttons = () => {
	return (
		<div>
			<Link to="/login"><button>login</button></Link>
			<Link to="/signup"><button>signup</button></Link>
			<Link to="/profile"><button>profile</button></Link>
			<Link to="/browse_users"><button>browse users</button></Link>
			<Link to="/chat"><button>chat</button></Link>
		</div>
	)
}

const NavBar = () => {
	const dispatch = useDispatch()

	const user = useSelector(state => state.user)

	const logOut = () => {
		signUpService.logOutUser()
		dispatch(setUser("Please login first"))
	}

	return (
		<>
			<p>User: {user} <button onClick={() => logOut()}>logout</button></p>
			<Buttons />
		</>
	)
}

export default NavBar
