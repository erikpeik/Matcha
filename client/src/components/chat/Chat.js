import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Paper, Grid, useMediaQuery, Typography, Button } from '@mui/material'
import chatService from '../../services/chatService'
import ChatBar from './ChatBar'
import ChatBody from './ChatBody'
import ChatFooter from './ChatFooter'
import { useSelector } from 'react-redux'
import Loader from '../Loader'

const NoConnections = () => {
	return (
		<Grid
			container
			spacing={0}
			direction="column"
			alignItems="center"
			justifyContent="center"
			style={{ minHeight: '50vh' }}
		>
			<Paper sx={{ p: 2, mt: 2, pl: 5, pr: 5, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
				<Typography variant='h1'>😔</Typography>
				<Typography variant='h5' color='#1c1c1c'>No Connections</Typography>
				<Button component={Link} to='/browsing'>Browse more</Button>
			</Paper>
		</Grid>
	)
}

const Chat = ({ socket }) => {
	const [messages, setMessages] = useState([])
	const [typingStatus, setTypingStatus] = useState('')
	const matches = useMediaQuery("(max-width:650px)");
	const user = useSelector(state => state.user)
	const [connections, setConnections] = useState(undefined)

	useEffect(() => {
		const getConnections = async () => {
			const connections = await chatService.chat_connections()
			console.log('connections:', connections)
			setConnections(connections)
		}
		getConnections()
	}, [])

	useEffect(() => {
		socket.on('receive_message', (data) => {
			console.log('message received:', data)
			setMessages([...messages, data])
		})
		return () => socket.off('receive_message')
	}, [socket, messages])

	useEffect(() => {
		socket.on('typingResponse', (data) => setTypingStatus(data))
	}, [typingStatus, socket])

	if (!connections) return <Loader />
	if (connections.length === 0) return <NoConnections />

	return (
		<Container maxWidth='lg' sx={{ pt: 5, pb: 5 }}>
			<Grid container spacing={2} direction={matches ? 'column' : 'row'}>
				<Grid item xs={4} md={4} >
					<ChatBar
						connections={connections}
						socket={socket} />
				</Grid>
				<Grid item xs={8} md={8}>
					<Paper>
						<ChatBody
							connections={connections}
							messages={messages}
							user={user}
							typingStatus={typingStatus}
						/>
						<ChatFooter
							socket={socket}
							user={user}
						/>
					</Paper>
				</Grid>
			</Grid>
		</Container>
	)
}

export default Chat
