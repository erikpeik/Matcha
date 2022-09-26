import { useEffect, useState} from 'react'
import { Container, Paper, Grid, useMediaQuery } from '@mui/material'
import ChatBar from './ChatBar'
import ChatBody from './ChatBody'
import ChatFooter from './ChatFooter'
import { useSelector } from 'react-redux'
// import Loader from './Loader'

const Chat = ({ socket }) => {
	const [messages, setMessages] = useState([])
	const [typingStatus, setTypingStatus] = useState('')
	const matches = useMediaQuery("(max-width:650px)");
	const user = useSelector(state => state.user)

	useEffect(() => {
		socket.on('messageResponse', (data) => {
			setMessages([...messages, data])
		})
	}, [socket, messages])

	useEffect(() => {
		socket.on('typingResponse', (data) => setTypingStatus(data))
	}, [typingStatus, socket])

	return (
		<Container maxWidth='lg' sx={{ pt: 5, pb: 5 }}>
			<Grid container spacing={2} direction={matches ? 'column' : 'row'}>
				<Grid item xs={4} md={4} >
					<ChatBar socket={socket} />
				</Grid>
				<Grid item xs={8} md={8}>
					<Paper>
						<ChatBody messages={messages} user={user} typingStatus={typingStatus} />
						<ChatFooter socket={socket} user={user} />
					</Paper>
				</Grid>
			</Grid>
		</Container>
	)
}

export default Chat
