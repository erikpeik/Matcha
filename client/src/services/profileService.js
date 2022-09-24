import axios from 'axios'
const baseUrl = '/api/profile'

const setUpProfile = ProfileSettings => {
	const request = axios.post(`${baseUrl}/setup`, ProfileSettings)
	return request.then(response => response.data)
}

const editUserSettings = ProfileSettings => {
	const request = axios.post(`${baseUrl}/editsettings`, ProfileSettings)
	return request.then(response => response.data)
}

const getProfileData = () => {
	const request = axios.get(`${baseUrl}`)
	return request.then(response => response.data)
}

const setProfilePic = Picture => {
	const request = axios.post(`${baseUrl}/setprofilepic`, Picture)
	return request.then(response => response.data)
}

const uploadPicture = Picture => {
	const request = axios.post(`${baseUrl}/imageupload`, Picture)
	return request.then(response => response.data)
}

const deletePicture = PictureId => {
	const request = axios.delete(`${baseUrl}/deletepicture/${PictureId}`)
	return request.then(response => response.data)
}

const profileService = { setUpProfile, getProfileData, setProfilePic, uploadPicture, deletePicture, editUserSettings }

export default profileService
