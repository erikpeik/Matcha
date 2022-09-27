import { Paper, Typography, Box } from '@mui/material'
import ChatIcon from './ChatIcon'

const ChatBar = ({ connectedUsers }) => {
	return (
		<Paper className='chat_sidebar'>
			<Typography variant='h5' align='center' sx={{ pt: 2 }}>Messages</Typography>
			<Box>
				<Box>
					{connectedUsers.map(user => {
						return (
							<Box key={user.id}>
								<ChatIcon username={user.username} image={user.profile_pic} />
								<Typography key={user.id}>
									{user.username}
								</Typography>
							</Box>
						)
					})}
				</Box>
			</Box>
		</Paper>
	)
}

export default ChatBar
