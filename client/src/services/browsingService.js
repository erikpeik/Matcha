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

const blockUser = user_id => {
	const request = axios.post(`${baseUrl}/blockuser/${user_id}`)
	return request.then(response => response.data)
}

const getUserLists = () => {
	const request = axios.get(`${baseUrl}/userlists`)
	return request.then(response => response.data)
}

const getUserProfile = (id) => {
	const request = axios.get(`${baseUrl}/userprofile/${id}`)
	return request.then(response => response.data)
}

const browsingService = {
	getAll, getSortedUsers, likeUser, unlikeUser, blockUser, getUserLists, getUserProfile
}

export default browsingService
