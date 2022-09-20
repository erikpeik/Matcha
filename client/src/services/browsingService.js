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

const browsingService = { getAll, getSortedUsers }

export default browsingService
