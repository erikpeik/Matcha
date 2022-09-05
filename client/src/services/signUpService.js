import axios from 'axios'
const baseUrl = '/api/signup'

const checkUniqueUser = signedUpUser => {
	const request = axios.post(`${baseUrl}/checkuser`, signedUpUser)
	return request.then(response => response.data)
}

const createUser = signedUpUser => {
	const request = axios.post(baseUrl, signedUpUser)
	return request.then(response => response.data)
}

const signUpService = { checkUniqueUser, createUser }

export default signUpService