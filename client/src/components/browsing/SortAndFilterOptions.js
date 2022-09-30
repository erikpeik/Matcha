import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, InputLabel, TextField,
	Select, MenuItem, Box, Slider, Button
} from '@mui/material'
import { setDisplaySettings } from '../../reducers/displaySettingsReducer'
import TagFilter from './TagFilter'
import { setBrowsingCriteria } from '../../reducers/browsingReducer'
import browsingService from '../../services/browsingService'

const SortAndFilterOptions = ({ setLocationFilter, setNameFilter, setTagFilter,
	browsingCriteria, setUsers }) => {

	const [sliderStatus, setSliderStatus] = useState(browsingCriteria)
	const displaySettings = useSelector(state => state.displaySettings)

	const dispatch = useDispatch()

	const submitSearchRequest = async () => {
		const newCriteria = { ...sliderStatus }
		const sortedUsers = await browsingService.getUsers(newCriteria)
		if (sortedUsers)
			setUsers(sortedUsers)
		dispatch(setBrowsingCriteria(newCriteria))
		dispatch(setDisplaySettings({ ...displaySettings, page: 1, offset: 0 }))
	}

	const handleAmount = (event) => {
		dispatch(setDisplaySettings({ ...displaySettings, page: 1, amount: event.target.value }))
	}

	const handleSorting = (event) => {
		dispatch(setDisplaySettings({ ...displaySettings, sorting: event.target.value }))
	}

	const handleSortOrder = async (event) => {
		dispatch(setDisplaySettings({ ...displaySettings, sort_order: event.target.value }))
	}

	const handleAgeSlider = (event) => {
		setSliderStatus({ ...sliderStatus, min_age: event.target.value[0], max_age: event.target.value[1] })
	}

	const handleFameSlider = (event) => {
		setSliderStatus({ ...sliderStatus, min_fame: event.target.value[0], max_fame: event.target.value[1] })
	}

	const handleDistanceSlider = (event) => {
		setSliderStatus({ ...sliderStatus, min_distance: event.target.value[0], max_distance: event.target.value[1] })
	}

	const handleNameFilter = (event) => {
		setNameFilter(event.target.value)
		dispatch(setDisplaySettings({ ...displaySettings, page: 1, offset: 0 }))
	}

	const handleLocationFilter = (event) => {
		setLocationFilter(event.target.value)
		dispatch(setDisplaySettings({ ...displaySettings, page: 1, offset: 0 }))
	}

	return (
		<>
			<FormControl fullWidth sx={{ mb: 2 }}>
				<InputLabel id='amount'>Amount of results per page:</InputLabel>
				<Select labelId='amount' id='amount' name='amount' value={displaySettings.amount} onChange={handleAmount} required>
					<MenuItem value={10} key={10}>{10}</MenuItem>
					<MenuItem value={50} key={50}>{50}</MenuItem>
					<MenuItem value={100} key={100}>{100}</MenuItem>
					<MenuItem value={250} key={250}>{250}</MenuItem>
					<MenuItem value={500} key={500}>{500}</MenuItem>
				</Select>
			</FormControl>
			<FormControl>
				<FormLabel id='sorted_by'>Results sorted by:</FormLabel>
				<RadioGroup row aria-labelledby='sorted_by' name='sorted_by' value={displaySettings.sorting} onChange={handleSorting}>
					<FormControlLabel value='age' control={<Radio />} label='Age' />
					<FormControlLabel value='distance' control={<Radio />} label='Distance' />
					<FormControlLabel value='fame_rating' control={<Radio />} label='Fame Rating' />
					<FormControlLabel value='common_tags' control={<Radio />} label='Common tags' />
				</RadioGroup>
			</FormControl>
			<Box>
				<FormControl sx={{ mb: 2 }}>
					<FormLabel id='asc_desc'></FormLabel>
					<RadioGroup row aria-labelledby='asc_desc' name='asc_desc' value={displaySettings.sort_order} onChange={handleSortOrder}>
						<FormControlLabel value='asc' control={<Radio />} label='Ascending' />
						<FormControlLabel value='desc' control={<Radio />} label='Descending' />
					</RadioGroup>
				</FormControl>
			</Box>
			<Box>
				<InputLabel id='namefilter'>Filter by:</InputLabel>
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					<TextField fullWidth margin='normal' name="username" label='Username' onChange={handleNameFilter}
						placeholder="Username" sx={{ mb: 2, width: 300 }} ></TextField>
					<TextField fullWidth margin='normal' name="location" label='Location' onChange={handleLocationFilter}
						placeholder="Location" sx={{ ml: 2, mb: 2, width: 300 }} ></TextField>
					<TagFilter setTagFilter={setTagFilter} setDisplaySettings={setDisplaySettings} />
				</Box>
			</Box>
			<Box sx={{ width: 300 }}>
				<InputLabel id='ageslider'>Filter by age:</InputLabel>
				<Slider
					min={18}
					max={120}
					aria-labelledby='age range'
					value={[sliderStatus.min_age, sliderStatus.max_age]}
					onChange={handleAgeSlider}
					valueLabelDisplay="auto"
				// getAriaValueText={valuetext}
				/>
			</Box>
			<Box sx={{ width: 300 }}>
				<InputLabel id='fameslider'>Filter by fame rating:</InputLabel>
				<Slider
					aria-labelledby='fame range'
					value={[sliderStatus.min_fame, sliderStatus.max_fame]}
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
					value={[sliderStatus.min_distance, sliderStatus.max_distance]}
					onChange={handleDistanceSlider}
					valueLabelDisplay="auto"
				// getAriaValueText={valuetext}
				/>
			</Box>
			<Button onClick={submitSearchRequest}>Search Results</Button>
		</>
	)
}

export default SortAndFilterOptions
