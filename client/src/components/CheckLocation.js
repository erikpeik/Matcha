import { useEffect } from 'react'
import { useDispatch } from "react-redux"
import { useLocation } from "react-router-dom"
import { changeNotification } from "../reducers/notificationReducer"


const CheckLocation = () => {
	const dispatch = useDispatch()
	const location = useLocation()

	useEffect(() => {
		dispatch(changeNotification(''))
	}, [location, dispatch])
}

export default CheckLocation
