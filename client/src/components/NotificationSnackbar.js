import { Alert, Snackbar } from "@mui/material";
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from "react";
import { changeNotification } from '../reducers/notificationReducer'
import { styled } from '@mui/material/styles'

const StyledSnackbar = styled((props) => <Snackbar {...props} />)(
	({ theme }) => ({
		"& .MuiSnackbarContent-root": {
			bottom: theme.spacing('150px')
		}
	})
)

const NotificationSnackbar = () => {
	const dispatch = useDispatch()
	const [open, setOpen] = useState(false);
	const notification = useSelector(state => state.notification)
	const severity = useSelector(state => state.severity)

	const handleClose = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		dispatch(changeNotification(''))
		setOpen(false);
	};

	useEffect(() => {
		if (notification != '') {
			setOpen(true);
			console.log('notification', notification)
		}
	}, [notification])

	return (
		<StyledSnackbar
			open={open}
			autoHideDuration={6000}
			anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
			onClose={handleClose}>
			<Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
				{notification}
			</Alert>
		</StyledSnackbar>
	)
}

export default NotificationSnackbar
