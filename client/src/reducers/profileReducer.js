import { createSlice } from '@reduxjs/toolkit'
import profileService from '../services/profileService'

const profileSlice = createSlice({
	name: 'profile',
	initialState: null,
	reducers: {
		setProfileData(state, action) {
			const content = action.payload
			return content
		}
	},
})

export const { setProfileData } = profileSlice.actions

export const getProfileData = () => {
	return async dispatch => {
		const profile = await profileService.getProfileData()
		if (profile) {
			dispatch(setProfileData(profile))
		} else {
			dispatch(setProfileData(null))
		}
	}
}

export default profileSlice.reducer
