import signUpService from '../services/signUpService'
import React from 'react'
import { Link } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { AppBar, Container, Toolbar, Box, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { ReactComponent as Logo } from '../images/matcha_logo.svg'


const Buttons = () => {
	return (
		<div>
			<Link to="/login"><button>login</button></Link>
			<Link to="/signup"><button>signup</button></Link>
			<Link to="/profile"><button>profile</button></Link>
			<Link to="/browse_users"><button>browse users</button></Link>
			<Link to="/chat"><button>chat</button></Link>
			<Link to="/phonebook"><button>phonebook</button></Link>
		</div>
	)
}

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

	// const pages = {'Login': '/login', 'Signup': '/signup', 'Browse Users': '/browse_users', 'Chat': '/chat', 'Phonebook': '/phonebook'}
	const pages = ["Login", "Signup", "Browse Users", "Chat", "Phonebook"]
	const settings = ['Profile', 'Settings', 'Log Out']

	const [anchorElNav, setAnchorElNav] = React.useState(null);
	const [anchorElUser, setAnchorElUser] = React.useState(null);

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
				<Toolbar disableGutters>
					<Logo height='50px' />
				</Toolbar>
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
						anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
						keepMounted
						transformOrigin={{ vertical: 'top', horizontal: 'right' }}
						open={Boolean(anchorElNav)}
						onClose={handleCloseNavMenu}
						sx={{ display: { xs: 'block', md: 'none' } }}
					>
						{pages.map((page) => (
							<Link to='/login'>
								<MenuItem onClick={handleCloseNavMenu} key={page}>
									<Typography textAlign='center' variant='h6'>{page}</Typography>
								</MenuItem>
							</Link>
						))}
					</Menu>
				</Box>
				<p>User: {user} <button onClick={() => logOut()}>logout</button></p>
				<Buttons />
			</Container>
		</AppBar>
	)
}

export default NavBar
