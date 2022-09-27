import { useSelector } from 'react-redux'
import { Button, Typography, Box, Paper } from '@mui/material'
import ChatIcon from './ChatIcon'

const ChatBody = ({ connectedUsers, messages, user, typingStatus }) => {
	const profileData = useSelector(state => state.profile)
	const onlineUsers = useSelector(state => state.onlineUsers)
	const usernames = onlineUsers.map(user => user.name)

	return (
		<>
			<div className='chat_mainHeader'>
				<Typography variant='h5'>Find your true love</Typography>
				<Button>Leave Chat</Button>
			</div>

			{messages.map(message => {
				if (message.name === user.name) {
					return (
						<Box key={message.id} sx={{
							display: 'flex', alignItems: "flex-start",
							justifyContent: 'flex-end', mb: 1
						}}>
							<Box sx={{ width: 3 / 4 }}>
								<Paper sx={{ ml: 1, background: 'rgb(240, 246, 233)' }}>
									<Typography sx={{ p: 1 }}>{message.text}</Typography>
								</Paper>
							</Box>
							<Box sx={{ ml: 1, mr: 1 }}>
								<ChatIcon username={message.name} image={profileData.profile_pic['picture_data']} />
							</Box>
						</Box>
					)
				} else {
					var userFromConnections = connectedUsers.find(user => user.username === message.name)
					var profile_pic = userFromConnections.profile_pic

					return (
						<Box key={message.id} sx={{
							display: 'flex', alignItems: "flex-start",
							justifyContent: 'flex-start', mb: 1
						}}>
							<Box sx={{ ml: 1 }}>
								<ChatIcon username={message.name} image={profile_pic} />
							</Box>
							<Box sx={{ width: 3 / 4 }}>
								<Paper sx={{ ml: 1, background: 'rgb(233, 240, 243)' }}>
									<Typography sx={{ p: 1 }}>{message.text}</Typography>
								</Paper>
							</Box>
						</Box>
					)
				}
			})}
			<Typography>{typingStatus}</Typography>
		</>
	)
}

export default ChatBody
