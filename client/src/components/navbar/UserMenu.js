import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
	Box, IconButton, Menu, MenuItem, Tooltip, Avatar, Button, Typography,
} from '@mui/material'
import { useSelector, useDispatch } from 'react-redux'
import CloseIcon from '@mui/icons-material/Close'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { clearUserNotifications, deleteUserNotification } from '../../reducers/userNotificationsReducer'

const UserMenu = ({ user }) => {
	const dispatch = useDispatch()
	const [anchorElUser, setAnchorElUser] = useState(null);
	const [anchorElNotifications, setAnchorElNotifications] = useState(null);
	const unreadNotifications = useSelector(state => state.userNotifications)

	const profileData = useSelector(state => state.profile)
	// console.log('profileData:', profileData)
	if (profileData != null && Object.keys(profileData).length > 0)
		var profile_pic = profileData.profile_pic['picture_data']

	const handleOpenUserMenu = (event) => {
		setAnchorElUser(event.currentTarget);
	};

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};

	const settings = {
		'Profile': '/profile',
		'Settings': '/settings',
		'Log Out': '/logout'
	}

	// console.log('profile_pic:', profile_pic)
	if (user !== undefined && user !== '' && profile_pic !== undefined) {
		return <>
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
				{unreadNotifications.map((notification, i) => {
					if (notification.redirect_path) {
						return (
							<Box sx={{ display: 'flex', alignItems: 'center' }} key={`box${i}`}>
								<Typography key={i} onClick={() => setAnchorElNotifications(null)}
									component={Link} to={notification.redirect_path}>
									{notification.notification_text}
								</Typography>
								<IconButton size='small'
									onClick={() => dispatch(deleteUserNotification(notification.notification_id))}>
									<CloseIcon sx={{ fontSize: 20 }} />
								</IconButton>
							</Box>
						)
					} else {
						return (
							<Box key={`box${i}`}>
								<Typography key={i}>
									{notification.notification_text}
								</Typography>
								<IconButton size='small'
									onClick={() => dispatch(deleteUserNotification(notification.notification_id))}>
									<CloseIcon sx={{ fontSize: 20 }} />
								</IconButton>
							</Box>
						)
					}
				})}
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
			<Box sx={{ flexGrow: 0 }}>
				<Menu
					sx={{ mt: '45px' }}
					id="menu-appbar"
					anchorEl={anchorElUser}
					anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
					keepMounted
					transformOrigin={{ vertical: 'top', horizontal: 'right' }}
					open={Boolean(anchorElUser)}
					onClose={handleCloseUserMenu}
				>
					{
						Object.keys(settings).map(setting =>
							<MenuItem key={setting} onClick={handleCloseUserMenu}
								component={Link} to={settings[setting]}>
								{setting}
							</MenuItem>
						)
					}
				</Menu>
				<Tooltip title="Open settings">
					<IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
						<Avatar
							src={profile_pic} />
					</IconButton>
				</Tooltip>
			</Box>
		</>
	}
}

export default UserMenu
