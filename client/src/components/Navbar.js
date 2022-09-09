import signUpService from '../services/signUpService'
import { Link } from 'react-router-dom'

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

export default NavBar
