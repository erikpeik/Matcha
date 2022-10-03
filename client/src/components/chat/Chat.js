import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { Container, Paper, Grid, useMediaQuery, Typography, Button } from '@mui/material'
import { addMessage } from '../../reducers/messagesReducer'
import chatService from '../../services/chatService'
import ChatBar from './ChatBar'
import ChatBody from './ChatBody'
import ChatFooter from './ChatFooter'
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
	const matches = useMediaQuery("(max-width:650px)");
	const [connections, setConnections] = useState(undefined)
	const dispatch = useDispatch()

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
			dispatch(addMessage(data))
		})
		return () => socket.off('receive_message')
	}, [socket, dispatch])

	if (!connections) return <Loader />
	if (connections.length === 0) return <NoConnections />

	return (
		<Container maxWidth='lg' sx={{ pt: 5, pb: 5 }}>
			<Grid container spacing={2} direction={matches ? 'column' : 'row'}>
				<Grid item xs={4} md={4}>
					<ChatBar
						connections={connections}
						socket={socket} />
				</Grid>
				<Grid item xs={8} md={8}>
					<Paper>
						<ChatBody
							connections={connections}
						/>
						<ChatFooter
							socket={socket} connections={connections}
						/>
					</Paper>
				</Grid>
			</Grid>
		</Container>
	)
}

export default Chat
