import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	amount: 10,
	page: 1,
	offset: 0
}

const displaySettingsSlice = createSlice({
	name: 'displaySettings',
	initialState,
	reducers: {
		setDisplaySettings(state, action) {
			const content = action.payload
			return content
		},
		resetDisplaySettings() {
			return initialState
		}
	},
})

export const { setDisplaySettings, resetDisplaySettings } = displaySettingsSlice.actions
export default displaySettingsSlice.reducer
