import { createSlice } from '@reduxjs/toolkit'
import browsingService from '../services/browsingService'

const initialState = { liked: [], connected: [], blocked: [] }

const userListSlice = createSlice({
	name: 'userLists',
	initialState,
	reducers: {
		setUserLists(state, action) {
			const content = action.payload
			return content
		},
		resetUserLists() {
			return initialState
		}
	},
})

export const { setUserLists, resetUserLists } = userListSlice.actions

export const getUserLists = () => {
	return async dispatch => {
		const userlists = await browsingService.getUserLists()
		if (userlists) {
			dispatch(setUserLists(userlists))
		}
	}
}

export default userListSlice.reducer
