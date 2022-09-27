import axios from 'axios'
const baseUrl = '/api/chat'

const getUsernames = () => {
	const request = axios.post(`${baseUrl}/usernames`)
	return request.then(response => response.data)
}

const chatService = { getUsernames }
export default chatService
