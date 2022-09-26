import { configureStore } from '@reduxjs/toolkit'
import userReducer from './reducers/userReducer'
import notificationReducer from './reducers/notificationReducer'
import severityReducer from './reducers/severityReducer'
import profileReducer from './reducers/profileReducer'
import onlineUsersReducer from './reducers/onlineUsersReducer'

const store = configureStore({
	reducer: {
		user: userReducer,
		notification: notificationReducer,
		severity: severityReducer,
		profile: profileReducer,
		onlineUsers: onlineUsersReducer,
	}
})

export default store
