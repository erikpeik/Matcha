import { useState, useEffect } from 'react'
import {
	FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, InputLabel,
	Select, MenuItem, Box, Slider, Container, Paper, Button, createTheme
} from '@mui/material'
import browsingService from '../services/browsingService'
import Loader from './Loader'
import { useNavigate } from 'react-router-dom'
import { setBrowsingCriteria } from '../reducers/browsingReducer'
import { useDispatch, useSelector } from 'react-redux'
import { getUserLists } from '../reducers/userListsReducer'
import { changeNotification, resetNotification } from '../reducers/notificationReducer'
import { changeSeverity } from '../reducers/severityReducer'
import Notification from './Notification'

const themelike = createTheme({
	palette: {
		primary: {
			main: '#4CBB17',
		},
		secondary: {
			main: '#F5F5F5',
		},
	}
})

const themeunlike = createTheme({
	palette: {
		primary: {
			main: '#FF1E56',
		},
		secondary: {
			main: '#F5F5F5',
		},
	}
})

const Browsing = () => {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const [isLoading, setLoading] = useState(true);
	const [users, setUsers] = useState([])
	const userLists = useSelector(state => state.userLists)

	const browsingCriteria = useSelector(state => state.browsingCriteria)
	const [searchCriteria, setSearchCriteria] = useState(browsingCriteria)

	useEffect(() => {
		dispatch(resetNotification())
		const getUsers = async () => {
			const sortedUsers = await browsingService.getSortedUsers(browsingCriteria)
			if (sortedUsers) {
				setUsers(sortedUsers)
				setLoading(false);
			}
			await dispatch(getUserLists())
		}
		getUsers()
	}, [dispatch, browsingCriteria])

	if (isLoading) {
		return <Loader />
	}

	var total_results
	var final_page
	if (users.length === 0)
		total_results = 0
	else
		total_results = users[0].total_results
	if (total_results === 0)
		final_page = 1
	else
		final_page = Math.ceil(total_results / searchCriteria.amount)

	const submitSearchRequest = async () => {
		const newCriteria = { ...searchCriteria, page: 1, offset: 0 }
		const sortedUsers = await browsingService.getSortedUsers(newCriteria)
		if (sortedUsers)
			setUsers(sortedUsers)
		setSearchCriteria(newCriteria)
		dispatch(setBrowsingCriteria(newCriteria))
	}

	const handleAmount = (event) => {
		const newCriteria = { ...searchCriteria, page: 1, amount: event.target.value }
		setSearchCriteria(newCriteria)
		dispatch(setBrowsingCriteria(newCriteria))
	}

	const handleSorting = (event) => {
		const newCriteria = { ...searchCriteria, sorting: event.target.value }
		setSearchCriteria(newCriteria)
		dispatch(setBrowsingCriteria(newCriteria))
	}

	const handleSortOrder = async (event) => {
		const newCriteria = { ...searchCriteria, sort_order: event.target.value }
		setSearchCriteria(newCriteria)
		dispatch(setBrowsingCriteria(newCriteria))
	}

	const handleAgeSlider = (event) => {
		setSearchCriteria({ ...searchCriteria, min_age: event.target.value[0], max_age: event.target.value[1] })
	}

	const handleFameSlider = (event) => {
		setSearchCriteria({ ...searchCriteria, min_fame: event.target.value[0], max_fame: event.target.value[1] })
	}

	const handleDistanceSlider = (event) => {
		setSearchCriteria({ ...searchCriteria, min_distance: event.target.value[0], max_distance: event.target.value[1] })
	}

	const handlePageChange = (page) => {
		if (final_page > 1) {
			const newCriteria = { ...searchCriteria, page: page, offset: (page - 1) * searchCriteria.amount }
			setSearchCriteria(newCriteria)
			dispatch(setBrowsingCriteria(newCriteria))
		}
	}

	const handlePageMinus = (page) => {
		if (page > 1) {
			const newCriteria = { ...searchCriteria, page: page - 1, offset: (page - 2) * searchCriteria.amount }
			setSearchCriteria(newCriteria)
			dispatch(setBrowsingCriteria(newCriteria))
		}
	}

	const handlePagePlus = (page) => {
		var offset
		if (page < final_page) {
			if (page === 1)
				offset = searchCriteria.amount
			else
				offset = (page - 2) * searchCriteria.amount
			const newCriteria = { ...searchCriteria, page: page + 1, offset: offset }
			setSearchCriteria(newCriteria)
			dispatch(setBrowsingCriteria(newCriteria))
		}
	}

	const likeUser = async (user_id) => {
		const result = await browsingService.likeUser(user_id)
		if (result === 'No profile picture') {
			dispatch(changeSeverity('error'))
			dispatch(changeNotification('You must set a profile picture before you can like other users.'))
		} else {
			dispatch(getUserLists())
		}
	}

	const unlikeUser = async (user_id) => {
		await browsingService.unlikeUser(user_id)
		dispatch(getUserLists())
	}

	const blockUser = async (user_id) => {
		await browsingService.blockUser(user_id)
		dispatch(getUserLists())
		dispatch(setBrowsingCriteria({ ...searchCriteria }))
	}

	return (
		<Container maxWidth='md' sx={{ pt: 5, pb: 5 }}>
			<Paper elevation={10} sx={{ p: 3 }}>
				<div className="pagination">
					<button onClick={() => handlePageChange(1)}>First</button>
					<button onClick={() => handlePageMinus(searchCriteria.page)}>&laquo;</button>
					<>		Page {searchCriteria.page} / {final_page}		</>
					<button onClick={() => handlePagePlus(searchCriteria.page)}>&raquo;</button>
					<button onClick={() => handlePageChange(final_page)}>Last</button>
				</div>
				<br></br>
				<FormControl fullWidth sx={{ mb: 2 }}>
					<InputLabel id='amount'>Amount of results per page:</InputLabel>
					<Select labelId='amount' id='amount' name='amount' value={searchCriteria.amount} onChange={handleAmount} required>
						<MenuItem value={10} key={10}>{10}</MenuItem>
						<MenuItem value={50} key={50}>{50}</MenuItem>
						<MenuItem value={100} key={100}>{100}</MenuItem>
						<MenuItem value={250} key={250}>{250}</MenuItem>
						<MenuItem value={500} key={500}>{500}</MenuItem>
					</Select>
				</FormControl>
				<FormControl sx={{ mb: 2 }}>
					<FormLabel id='sorted_by'>Results sorted by:</FormLabel>
					<RadioGroup row aria-labelledby='sorted_by' name='sorted_by' value={searchCriteria.sorting} onChange={handleSorting}>
						<FormControlLabel value='age' control={<Radio />} label='Age' />
						<FormControlLabel value='distance' control={<Radio />} label='Distance' />
						<FormControlLabel value='fame_rating' control={<Radio />} label='Fame Rating' />
						<FormControlLabel value='common_tags' control={<Radio />} label='Common tags' />
					</RadioGroup>
				</FormControl>
				<Box>
					<FormControl sx={{ mb: 2 }}>
						<FormLabel id='asc_desc'></FormLabel>
						<RadioGroup row aria-labelledby='asc_desc' name='asc_desc' value={searchCriteria.sort_order} onChange={handleSortOrder}>
							<FormControlLabel value='asc' control={<Radio />} label='Ascending' />
							<FormControlLabel value='desc' control={<Radio />} label='Descending' />
						</RadioGroup>
					</FormControl>
				</Box>
				<Box sx={{ width: 300 }}>
					<InputLabel id='ageslider'>Filter by age:</InputLabel>
					<Slider
						min={18}
						max={120}
						aria-labelledby='age range'
						value={[searchCriteria.min_age, searchCriteria.max_age]}
						onChange={handleAgeSlider}
						valueLabelDisplay="auto"
					// getAriaValueText={valuetext}
					/>
				</Box>
				<Box sx={{ width: 300 }}>
					<InputLabel id='fameslider'>Filter by fame rating:</InputLabel>
					<Slider
						aria-labelledby='fame range'
						value={[searchCriteria.min_fame, searchCriteria.max_fame]}
						onChange={handleFameSlider}
						valueLabelDisplay="auto"
					// getAriaValueText={valuetext}
					/>
				</Box>
				<Box sx={{ width: 300 }}>
					<InputLabel id='distanceslider'>Filter by distance:</InputLabel>
					<Slider
						min={0}
						max={20000}
						aria-labelledby='distance range'
						value={[searchCriteria.min_distance, searchCriteria.max_distance]}
						onChange={handleDistanceSlider}
						valueLabelDisplay="auto"
					// getAriaValueText={valuetext}
					/>
				</Box>
				<Button onClick={submitSearchRequest}>Search Results</Button>
				{users.map(user => {
					var button
					if (userLists.connected.includes(user.id)) {
						button = <div><Button theme={themeunlike} onClick={() => { unlikeUser(user.id) }}>Unlike user</Button><Button>Connected</Button></div>
					} else if (userLists.liked.includes(user.id)) {
						button = <Button theme={themeunlike} onClick={() => { unlikeUser(user.id) }}>Unlike user</Button>
					} else {
						button = <Button theme={themelike} onClick={() => { likeUser(user.id) }}>Like user</Button>
					}
					if (!user.id) {
						return (<div key="emptyusers"></div>)
					} else
						return (<div key={`profile_container${user.id}`} id="profile_container">
							<div key={`picture_container${user.id}`} id="picture_container">
								<img key={user.id} alt="profile_picture" src={user.profile_pic} className="userprofilepic"
									onClick={() => navigate(`/userprofile/${user.id}`)} height="200px"></img>
							</div>
							<div key={`profile_data${user.id}`} id="profile_data">
								<h1>{user.username}</h1>
								<h3>Fame rating: {user.fame_rating}</h3>
								<br></br>
								<p>First name: {user.firstname}</p>
								<p>Last name: {user.lastname}</p>
								<p>Gender: {user.gender}</p>
								<p>Age: {user.age}</p>
								<p>Sexual preference: {user.sexual_pref}</p>
								<p>Location: {user.user_location}</p>
								<p>Distance: {Math.floor(user.distance)} km</p>
								<p>Biography: {user.biography}</p>
								<p>Common tags: {user.common_tags}</p>
								{button}
								<Button theme={themeunlike} onClick={() => { blockUser(user.id) }}>Block user</Button>
							</div>
						</div>
						)
				}
				)}
			</Paper>
			<Notification />
		</Container >
	)

}

export default Browsing
