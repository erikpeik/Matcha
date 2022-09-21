import { useState, useEffect } from 'react'
import {
	FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, InputLabel,
	Select, MenuItem, Box, Slider, Container, Paper
} from '@mui/material'
import browsingService from '../services/browsingService'
import Loader from './Loader'

const Browsing = () => {
	const [isLoading, setLoading] = useState(true);
	const [users, setUsers] = useState([])
	const [searchCriteria, setSearchCriteria] = useState({
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
	})

	useEffect(() => {
		const getUsers = async () => {
			const { total_results: totalResults, ...sortedUsersObj} = await browsingService.getSortedUsers(searchCriteria)
			console.log("Total results: ", totalResults)
			const sortedUsers = Object.values(sortedUsersObj)
			if (sortedUsers[0]) {
				console.log("Fetched users: ", sortedUsers)
				setUsers(sortedUsers)
				setLoading(false);
			}
		}
		getUsers()
	}, [searchCriteria])

	const handleAmount = (event) => {
		setSearchCriteria({ ...searchCriteria, amount: event.target.value })
	}

	const handleSorting = (event) => {
		setSearchCriteria({ ...searchCriteria, sorting: event.target.value })
	}

	const handleSortOrder = (event) => {
		setSearchCriteria({ ...searchCriteria, sort_order: event.target.value })
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
		setSearchCriteria({ ...searchCriteria, page: page, offset: (page - 1) * searchCriteria.amount})
	}

	if (isLoading) {
		return <Loader />;
	} else {
		const profile_pic = require('../images/demo_profilepic.jpeg')
		console.log("amount we got: ", users.length)
		console.log("amount we wanted: ", searchCriteria.amount)
		console.log("offset: ", searchCriteria.offset)
		return (
			<Container maxWidth='md' sx={{ pt: 5, pb: 5 }}>
				<Paper elevation={10} sx={{ p: 3 }}>
					<div className="pagination">
						<button onClick={() => handlePageChange(1)}>First</button>
						<button onClick={() => handlePageChange( searchCriteria.page - 1)}>&laquo;</button>
						<>		Page {searchCriteria.page} / { users.length / searchCriteria.amount}		</>
						<button onClick={() => handlePageChange( searchCriteria.page + 1)}>&raquo;</button>
						<button onClick={() => handlePageChange(users.length / searchCriteria.amount)}>Last</button>
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
					{users.map(user =>
						<div key={`profile_container${user.id}`} id="profile_container">
							<div key={`picture_container${user.id}`} id="picture_container">
								<img key={user.id} alt="profile_picture" src={profile_pic} height="200px"></img>
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
							</div>
						</div>
					)}
				</Paper>
			</Container>
		)
	}
}

export default Browsing
