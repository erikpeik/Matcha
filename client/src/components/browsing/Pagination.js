import { useDispatch, useSelector } from 'react-redux'
import { setDisplaySettings } from '../../reducers/displaySettingsReducer'

const Pagination = ({ filteredUsers }) => {
	const dispatch = useDispatch()
	const displaySettings = useSelector(state => state.displaySettings)

	var total_results
	var final_page
	if (filteredUsers.length === 0)
		total_results = 0
	else
		total_results = filteredUsers.length
	if (total_results === 0)
		final_page = 1
	else
		final_page = Math.ceil(total_results / displaySettings.amount)

	const handlePageChange = (newPage) => {
		if (final_page > 1) {
			dispatch(setDisplaySettings({ ...displaySettings, page: newPage, offset: (newPage - 1) * displaySettings.amount }))
		}
	}

	const handlePageMinus = (newPage) => {
		if (newPage > 0) {
			dispatch(setDisplaySettings({ ...displaySettings, page: newPage, offset: (newPage - 1) * displaySettings.amount }))
		}
	}

	const handlePagePlus = (newPage) => {
		var offset
		if (newPage <= final_page) {
			if (newPage === 1)
				offset = displaySettings.amount
			else
				offset = (newPage - 1) * displaySettings.amount
			dispatch(setDisplaySettings({ ...displaySettings, page: newPage, offset: offset }))
		}
	}

	return (
		<>
			<div className="pagination">
				<button onClick={() => handlePageChange(1)}>First</button>
				<button onClick={() => handlePageMinus(displaySettings.page - 1)}>&laquo;</button>
				<>		Page {displaySettings.page} / {final_page}		</>
				<button onClick={() => handlePagePlus(displaySettings.page + 1)}>&raquo;</button>
				<button onClick={() => handlePageChange(final_page)}>Last</button>
			</div>
			<br></br>
		</>

	)
}

export default Pagination
