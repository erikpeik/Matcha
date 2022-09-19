import axios from 'axios'
const baseUrl = '/api/browsing'

const getAll = () => {
	const request = axios.get(`${baseUrl}`)
	return request.then(response => response.data)
}

const browsingService = { getAll }

export default browsingService
