import { useState, useEffect } from 'react'
import { Container, Paper } from '@mui/material'
import browsingService from '../services/browsingService'
import Loader from './Loader'
import { useDispatch, useSelector } from 'react-redux'
import { getUserLists } from '../reducers/userListsReducer'
import { resetNotification } from '../reducers/notificationReducer'
import Notification from './Notification'
import Pagination from './browsing/Pagination'
import SortAndFilterOptions from './browsing/SortAndFilterOptions'
import UserPreviews from './browsing/UserPreviews'

const filterUsers = (users, filters, profileData) => {

	var filteredUsers = users
	if (filters.nameFilter)
		filteredUsers = users.filter(user => user.username.includes(filters.nameFilter))

	if (filters.locationFilter) {
		filteredUsers = filteredUsers.filter(user =>
			user.user_location.toLowerCase().includes(filters.locationFilter.toLowerCase()))
	}

	if (filters.tagFilter) {
		filteredUsers = filteredUsers.filter(user => {
			return filters.tagFilter.every(tag => {
				return tag.tagged_users.includes(user.id)
			})
		})
	}

	const filterSex = () => {
		switch (true) {
			case (profileData.gender === 'male' && profileData.sexual_pref === 'male'):
				return filteredUsers.filter(user => user.gender === 'male' && (user.sexual_pref === 'male' || user.sexual_pref === 'bisexual'))
			case (profileData.gender === 'male' && profileData.sexual_pref === 'female'):
				return filteredUsers.filter(user => user.gender === 'female' && (user.sexual_pref === 'male' || user.sexual_pref === 'bisexual'))
			case (profileData.gender === 'male' && profileData.sexual_pref === 'bisexual'):
				return filteredUsers.filter(user => user.sexual_pref === 'male' || user.sexual_pref === 'bisexual')
			case (profileData.gender === 'female' && profileData.sexual_pref === 'male'):
				return filteredUsers.filter(user => user.gender === 'male' && (user.sexual_pref === 'female' || user.sexual_pref === 'bisexual'))
			case (profileData.gender === 'female' && profileData.sexual_pref === 'female'):
				return filteredUsers.filter(user => user.gender === 'female' && (user.sexual_pref === 'female' || user.sexual_pref === 'bisexual'))
			case (profileData.gender === 'female' && profileData.sexual_pref === 'bisexual'):
				return filteredUsers.filter(user => user.sexual_pref === 'female' || user.sexual_pref === 'bisexual')
			case (profileData.gender === 'other' && profileData.sexual_pref === 'male'):
				return filteredUsers.filter(user => user.gender === 'male' && user.sexual_pref === 'bisexual')
			case (profileData.gender === 'other' && profileData.sexual_pref === 'female'):
				return filteredUsers.filter(user => user.gender === 'female' && user.sexual_pref === 'bisexual')
			case (profileData.gender === 'other' && profileData.sexual_pref === 'bisexual'):
				return filteredUsers.filter(user => user.sexual_pref === 'bisexual')
			default:
				return filteredUsers
		}
	}
	return filterSex()
}

const sortUsers = (filteredUsers, displaySettings) => {

	const sorting = displaySettings.sorting
	const sort_order = displaySettings.sort_order
	switch (true) {
		case (sorting === 'age' && sort_order === 'asc'):
			return filteredUsers.sort((a, b) => (a.age > b.age ? 1 : -1))
		case (sorting === 'age' && sort_order === 'desc'):
			return filteredUsers.sort((a, b) => (a.age > b.age ? -1 : 1))
		case (sorting === 'distance' && sort_order === 'asc'):
			return filteredUsers.sort((a, b) => (a.distance > b.distance ? 1 : -1))
		case (sorting === 'distance' && sort_order === 'desc'):
			return filteredUsers.sort((a, b) => (a.distance > b.distance ? -1 : 1))
		case (sorting === 'fame_rating' && sort_order === 'asc'):
			return filteredUsers.sort((a, b) => (a.fame_rating > b.fame_rating ? 1 : -1))
		case (sorting === 'fame_rating' && sort_order === 'desc'):
			return filteredUsers.sort((a, b) => (a.fame_rating > b.fame_rating ? -1 : 1))
		case (sorting === 'common_tags' && sort_order === 'asc'):
			return filteredUsers.sort((a, b) => (a.common_tags > b.common_tags ? 1 : -1))
		case (sorting === 'common_tags' && sort_order === 'desc'):
			return filteredUsers.sort((a, b) => (a.common_tags > b.common_tags ? -1 : 1))
		default:
			return filteredUsers
	}

}

const Browsing = () => {

	const dispatch = useDispatch()

	const [isLoading, setLoading] = useState(true);
	const [users, setUsers] = useState([])
	const [nameFilter, setNameFilter] = useState()
	const [locationFilter, setLocationFilter] = useState()
	const [tagFilter, setTagFilter] = useState([])

	const profileData = useSelector(state => state.profile)
	const browsingCriteria = useSelector(state => state.browsingCriteria)
	const displaySettings = useSelector(state => state.displaySettings)
	const [searchCriteria, setSearchCriteria] = useState(browsingCriteria)

	useEffect(() => {
		dispatch(resetNotification())
		const getUsers = async () => {
			const allUsers = await browsingService.getUsers(browsingCriteria)
			if (allUsers) {
				setUsers(allUsers)
				setLoading(false);
			}
			await dispatch(getUserLists())
		}
		getUsers()
	}, [dispatch, browsingCriteria])

	if (isLoading) {
		return <Loader />
	}

	var filters = { nameFilter: nameFilter, locationFilter: locationFilter, tagFilter: tagFilter }
	var filteredUsers = filterUsers(users, filters, profileData)

	var sortedUsers = sortUsers(filteredUsers, displaySettings)

	var pageUsers = sortedUsers.slice(displaySettings.offset, displaySettings.offset + displaySettings.amount)

	return (
		<Container maxWidth='md' sx={{ pt: 5, pb: 5 }}>
			<Paper elevation={10} sx={{ p: 3 }}>
				<Pagination filteredUsers={filteredUsers} />
				<SortAndFilterOptions setLocationFilter={setLocationFilter} setNameFilter={setNameFilter} setTagFilter={setTagFilter}
					searchCriteria={searchCriteria} setSearchCriteria={setSearchCriteria} setUsers={setUsers} />
				<UserPreviews pageUsers={pageUsers} searchCriteria={searchCriteria} />
			</Paper>
			<Notification />
		</Container >
	)

}

export default Browsing
