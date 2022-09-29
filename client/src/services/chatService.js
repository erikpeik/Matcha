import axios from 'axios'
const baseUrl = '/api/chat'

const getUsernames = () => {
	const request = axios.post(`${baseUrl}/usernames`)
	return request.then(response => response.data)
}

const chat_connections = () => {
	const request = axios.get(`${baseUrl}/chat_connections`)
	return request.then(response => response.data)
}

const getRoomMessages = (room) => {
	const request = axios.post(`${baseUrl}/room_messages`, { room })
	return request.then(response => response.data)
}

const chatService = { getUsernames, chat_connections, getRoomMessages }
export default chatService
