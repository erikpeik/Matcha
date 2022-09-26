import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createTheme } from '@mui/material/styles'
import {
	AppBar, Container, Toolbar, Box, IconButton,
	Menu, MenuItem, Button, Tooltip, Avatar
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { ReactComponent as Logo } from '../images/matcha_logo.svg'
import avatar from '../images/random_picture.jpeg'
import { useSelector } from 'react-redux'

const navbar_theme = createTheme({
	palette: {
		primary: {
			main: '#f5f5f5',
		},
		secondary: {
			main: '#FF1E56',
		},
	}
})

const UserMenu = ({ user }) => {
	const [anchorElUser, setAnchorElUser] = useState(null);

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

	if (user !== undefined && user !== '') {

		return <Box sx={{ flexGrow: 0 }}>
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
						src={avatar} />
				</IconButton>
			</Tooltip>
		</Box>
	}
}


const NavBar = ({ socket }) => {
	const [anchorElNav, setAnchorElNav] = useState(null)
	const [userLoading, setLoading] = useState(true);

	const user = useSelector(state => {
		if (userLoading)
			setLoading(false)
		return (state.user)
	})

	let pages = {}


	if (user) {
		console.log("user:", user)
		if (user.name) {
			console.log("user.name:", user.name)
			console.log("user.name length:", user.name.length)
			socket.emit("newUser", { name: user.name, socketID: socket.id })
		}
	}

	if (userLoading) {
		return (<></>)
	} else if (user === '') {
		pages = {
			'Login': '/login',
			'Signup': '/signup',
		}
	} else {
		pages = {
			'Profile': '/profile',
			'Browsing': '/browsing',
			'Chat': '/chat',
			'Log Out': '/logout'
		}
	}

	const handleOpenNavMenu = (event) => {
		setAnchorElNav(event.currentTarget);
	};

	const handleCloseNavMenu = () => {
		setAnchorElNav(null);
	};

	return (
		<AppBar position="static" theme={navbar_theme}>
			<Container maxWidth='xl'>
				<Toolbar disableGutters>
					<Box
						component={Link}
						to='/'
						sx={{
							display: { xs: 'none', md: 'flex', marginRight: 20 },
							height: '40px'
						}}
					>
						<Logo />
					</Box>
					<Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
						<IconButton
							size="large"
							aria-label="account of current user"
							aria-controls="menu-appbar"
							aria-haspopup="true"
							onClick={handleOpenNavMenu}
							color="inherit"
						>
							<MenuIcon />
						</IconButton>
						<Menu
							id="menu-appbar"
							anchorEl={anchorElNav}
							anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
							keepMounted
							transformOrigin={{ vertical: 'top', horizontal: 'right' }}
							open={Boolean(anchorElNav)}
							onClose={handleCloseNavMenu}
							sx={{ display: { xs: 'block', md: 'none' } }}
						>
							{
								Object.keys(pages).map((page) => {
									return (
										<MenuItem key={page} onClick={handleCloseNavMenu} component={Link} to={pages[page]}>
											{page}
										</MenuItem>
									)
								})
							}
						</Menu>
					</Box>
					<Box
						sx={{
							flexGrow: 1,
							height: '40px',
							display: { xs: 'flex', md: 'none' }
						}}
						component={Link}
						to='/'
					>
						<Logo />
					</Box>

					<Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
						{
							Object.keys(pages).map((page) => {
								return (
									<Button
										color="inherit"
										key={page}
										onClick={handleCloseNavMenu}
										sx={{ mr: 2 }}
										component={Link} to={pages[page]}
									>
										{page}
									</Button>
								)
							})
						}
					</Box>
					<UserMenu user={user} />
				</Toolbar>
			</Container>
		</AppBar >
	)
}

export default NavBar
