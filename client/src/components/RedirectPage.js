import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const RedirectPage = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const user = useSelector(state => state.user)

	useEffect(() => {
		const redirectPages = ['/login', '/signup', '/login/resetpassword']

		if (user !== null) {
			// console.log("User :", user)
			console.log("Location: ", location.pathname)
			if (user === '') {
				if (!redirectPages.includes(location.pathname) && location.pathname.includes('resetpassword') === false) {
					navigate('/login')
				}
			} else {
				if (redirectPages.includes(location.pathname)) {
					navigate('/profile')
				}
			}
		}
	}, [location, navigate, user])
}

export default RedirectPage
