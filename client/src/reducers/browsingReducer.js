import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	min_age: 18,
	max_age: 120,
	min_fame: 0,
	max_fame: 100,
	min_distance: 0,
	max_distance: 20000,
	location: 'any',
	sorting: 'age',
	sort_order: 'asc',
	amount: 10,
	page: 1,
	offset: 0
}

const userSlice = createSlice({
	name: 'browsingCriteria',
	initialState,
	reducers: {
		setBrowsingCriteria(state, action) {
			const content = action.payload
			return content
		}
	},
})

export const { setBrowsingCriteria } = userSlice.actions
export default userSlice.reducer