import axios from 'axios'
const baseUrl = '/api/profile'

const setUpProfile = ProfileSettings => {
	const request = axios.post(`${baseUrl}/setup`, ProfileSettings)
	return request.then(response => response.data)
}

const profileService = { setUpProfile }

export default profileService