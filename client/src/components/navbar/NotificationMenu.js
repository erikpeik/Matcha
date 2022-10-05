import CloseIcon from '@mui/icons-material/Close'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { clearUserNotifications, deleteUserNotification } from '../../reducers/userNotificationsReducer'
import { Button, Typography, Box, IconButton, Menu } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const NotificationMenu = () => {
	const [anchorElNotifications, setAnchorElNotifications] = useState(null);
	const unreadNotifications = useSelector(state => state.userNotifications)
	const dispatch = useDispatch()

	return (
		<>
			<Menu
				sx={{ mt: '45px' }}
				id="user-notifications"
				anchorEl={anchorElNotifications}
				anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
				keepMounted
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				open={Boolean(anchorElNotifications)}
				onClose={() => setAnchorElNotifications(null)}
			>
				<Box sx={{ p: '0 5px', maxHeight: 500, overflow: 'auto' }}>
					{unreadNotifications.map((notification, i) => {
						if (notification.redirect_path) {
							return (
								<Box sx={{ display: 'flex', alignItems: 'center' }} key={`box${i}`}>
									<Typography
										key={i} onClick={() => setAnchorElNotifications(null)}
										component={Link} to={notification.redirect_path}
										sx={{ width: 300 }}
									>
										{notification.notification_text}
									</Typography>
									<IconButton
										size='small'
										onClick={() => dispatch(deleteUserNotification(notification.notification_id))}
									>
										<CloseIcon sx={{ fontSize: 20 }} />
									</IconButton>
								</Box>
							)
						} else {
							return (
								<Box container sx={{ display: 'flex', alignItems: 'center' }} key={`box${i}`}>
									<Typography key={i} sx={{ maxWidth: 300 }}>
										{notification.notification_text}
									</Typography>
									<IconButton
										size='small'
										onClick={() => dispatch(deleteUserNotification(notification.notification_id))}
									>
										<CloseIcon sx={{ fontSize: 20 }} />
									</IconButton>
								</Box>
							)
						}
					})}
				</Box>
				<Button onClick={() => dispatch(clearUserNotifications())}>Clear notifications</Button>
			</Menu>
			<Button onClick={(event) => setAnchorElNotifications(event.currentTarget)}
				sx={{
					minWidth: 0,
					borderRadius: '50%',
					width: '40px',
					height: '40px',
					mr: 1,
					backgroundColor: 'rgb(255, 99, 92)',
					color: '#FFFFFF',
					'&:hover': {
						backgroundColor: 'rgb(255, 99, 92)',
						boxShadow: 2
					}
				}}>
				<NotificationsIcon sx={{ fontSize: '28px' }} />
			</Button>
		</>
	)
}

export default NotificationMenu
