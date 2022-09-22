import { Paper, Typography } from '@mui/material'

const ChatBar = () => {
	return (
		<Paper className='chat_sidebar'>
			<Typography variant='h5' align='center' sx={{pt: 2}}>Open Chat</Typography>
			<div>
				<Typography sx={{fontWeight: 'bold'}}>Online Users</Typography>
				<div className='chat_header'>
					<p>User 1</p>
					<p>User 2</p>
					<p>User 2</p>
					<p>User 3</p>
				</div>
			</div>
		</Paper>
	)
}

export default ChatBar
