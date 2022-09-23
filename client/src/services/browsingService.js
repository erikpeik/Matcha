import axios from 'axios'
const baseUrl = '/api/browsing'

const getAll = () => {
	const request = axios.get(`${baseUrl}`)
	return request.then(response => response.data)
}

const getSortedUsers = searchCriteria => {
	const request = axios.post(`${baseUrl}/sorted`, searchCriteria)
	return request.then(response => response.data)
}

const likeUser = user_id => {
	const request = axios.post(`${baseUrl}/likeuser/${user_id}`)
	return request.then(response => response.data)
}

const unlikeUser = user_id => {
	const request = axios.post(`${baseUrl}/unlikeuser/${user_id}`)
	return request.then(response => response.data)
}

const getLikedUsers = () => {
	const request = axios.get(`${baseUrl}/likedusers`)
	return request.then(response => response.data)
}

const getConnectedUsers = () => {
	const request = axios.get(`${baseUrl}/connectedusers`)
	return request.then(response => response.data)
}

const browsingService = { getAll, getSortedUsers, likeUser, unlikeUser, getLikedUsers, getConnectedUsers }

export default browsingService
