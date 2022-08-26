import axios from 'axios'
const baseUrl = '/api/signup'

const checkUniqueName = signedUpUser => {
	const request = axios.post(`${baseUrl}/checkname`, signedUpUser)
	return request.then(response => response.data)
}

const createUser = signedUpUser => {
	const request = axios.post(baseUrl, signedUpUser)
	return request.then(response => response.data)
}

const signUpService = { checkUniqueName, createUser }

export default signUpService