import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Paper, Typography, Box } from '@mui/material'
import { changeOnlineUsers } from '../../reducers/onlineUsersReducer'
const ChatBar = ({ socket }) => {
	const onlineUsers = useSelector(state => state.onlineUsers)
	const dispatch = useDispatch()
	useEffect(() => {
		socket.on('newUserResponse', (data) => dispatch(changeOnlineUsers(data)))
		// console.log('users from chat:', onlineUsers)
	}, [socket, onlineUsers])

	return (
		<Paper className='chat_sidebar'>
			<Typography variant='h5' align='center' sx={{ pt: 2 }}>Open Chat</Typography>
			<Box>
				<Typography sx={{ fontWeight: 'bold' }}>Online Users</Typography>
				<Box>
					{onlineUsers.map(user =>
						<Typography key={user.socketID}>
							{user.name}
						</Typography>
					)}
				</Box>
			</Box>
		</Paper>
	)
}

export default ChatBar
