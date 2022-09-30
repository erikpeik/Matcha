import { createSlice } from '@reduxjs/toolkit'
import profileService from '../services/profileService'

const initialState = []

const userNotificationSlice = createSlice({
	name: 'userNotifications',
	initialState,
	reducers: {
		setUserNotifications(state, action) {
			const content = action.payload
			return content
		},
		resetUserNotifications() {
			return initialState
		}
	},
})

export const { setUserNotifications, resetUserNotifications } = userNotificationSlice.actions

export const getUserNotifications = () => {
	return async dispatch => {
		const notifications = await profileService.getNotifications()
		if (notifications)
			dispatch(setUserNotifications(notifications))
	}
}

export default userNotificationSlice.reducer
