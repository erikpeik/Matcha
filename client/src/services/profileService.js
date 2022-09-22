import axios from 'axios'
const baseUrl = '/api/profile'

const setUpProfile = ProfileSettings => {
	const request = axios.post(`${baseUrl}/setup`, ProfileSettings)
	return request.then(response => response.data)
}

const getProfileData = () => {
	const request = axios.get(`${baseUrl}`)
	return request.then(response => response.data)
}

const uploadPicture = Picture => {
	const request = axios.post(`${baseUrl}/imageupload`, Picture)
	return request.then(response => response.data)
}

const profileService = { setUpProfile, getProfileData, uploadPicture }

export default profileService