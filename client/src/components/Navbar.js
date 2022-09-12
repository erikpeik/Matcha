import signUpService from '../services/signUpService'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import {
	AppBar, Container, Toolbar, Box, IconButton, Menu, MenuItem,
	Typography, Button, Tooltip, Avatar
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { ReactComponent as Logo } from '../images/matcha_logo.svg'
import avatar from '../images/random_picture.jpeg'
import { useLocation } from 'react-router-dom'
import { margin } from '@mui/system'

// const Buttons = () => {
// 	return (
// 		<div>
// 			<Link to="/login"><button>login</button></Link>
// 			<Link to="/signup"><button>signup</button></Link>
// 			<Link to="/profile"><button>profile</button></Link>
// 			<Link to="/browse_users"><button>browse users</button></Link>
// 			<Link to="/chat"><button>chat</button></Link>
// 			<Link to="/phonebook"><button>phonebook</button></Link>
// 		</div>
// 	)
// }





const navbar_theme = createTheme({
	palette: {
		primary: {
			main: '#323232',
		},
		secondary: {
			main: '#FF1E56',
		},
	}
})

const NavBar = ({ user, setUser }) => {
	const logOut = () => {
		signUpService.logOutUser()
		setUser("")
	}

	const pages = {
		'Login': '/login',
		'Signup': '/signup',
		'Browse Users': '/browse_users',
		'Chat': '/chat',
		'Phonebook': '/phonebook'
	}
	const settings = {
		'Profile': '/profile',
		'Settings': '/settings',
		'Log Out': '/logout'
	}

	const [anchorElNav, setAnchorElNav] = useState(null);
	const [anchorElUser, setAnchorElUser] = useState(null);

	const handleOpenNavMenu = (event) => {
		setAnchorElNav(event.currentTarget);
	};
	const handleOpenUserMenu = (event) => {
		setAnchorElUser(event.currentTarget);
	};

	const handleCloseNavMenu = () => {
		setAnchorElNav(null);
	};

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};

	return (
		<AppBar position="static" theme={navbar_theme}>
			<Container maxWidth='xl'>

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
					<Toolbar disableGutters>
						<Logo
							height='40px'
							sx={{
								display: { xs: 'none', md: 'flex' },
								mr: 1,
								margin: '10px'
							}} />
					</Toolbar>

					<Menu
						id="menu-appbar"
						anchorEl={anchorElNav}
						anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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

				<Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
					<Logo
						height='40px'
						sx={{
							mr: 2,
							display: { xs: 'flex', md: 'none' },
							mt: 45,
						}}
					/>
					{
						Object.keys(pages).map((page) => {
							return (
								<Button
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
							Object.keys(settings).map((setting) => {
								return (
									<MenuItem key={setting} onClick={handleCloseNavMenu} component={Link} to={settings[setting]}>
										{setting}
									</MenuItem>
								)
							})
						}
					</Menu>
					{/* <Tooltip title="Open settings">
						<IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
							<Avatar
								src={avatar} />
						</IconButton>
					</Tooltip> */}
				</Box>
				{/* <p>User: {user} <button onClick={() => logOut()}>logout</button></p>
				<Buttons /> */}
			</Container>
		</AppBar>
	)
}

export default NavBar
