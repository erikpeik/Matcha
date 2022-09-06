import axios from 'axios'
const baseUrl = '/api'

const checkUserForm = signedUpUser => {
	const request = axios.post(`${baseUrl}/signup/checkuser`, signedUpUser)
	return request.then(response => response.data)
}

const createUser = signedUpUser => {
	const request = axios.post(`${baseUrl}/signup`, signedUpUser)
	return request.then(response => response.data)
}

const logInUser = signedUpUser => {
	const request = axios.post(`${baseUrl}/login`, signedUpUser)
	return request.then(response => response.data)
}

const signUpService = { checkUserForm, createUser, logInUser }

export default signUpService