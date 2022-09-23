import { Button, Typography, Box, Paper } from '@mui/material'

const ChatBody = ({ messages, user }) => {
	return (
		<>
			<div className='chat_mainHeader'>
				<Typography variant='h5'>Find your true love</Typography>
				<Button>Leave Chat</Button>
			</div>

			{messages.map(message => {
				if (message.name === user.user) {
					return (
						<Box key={message.id} sx={{ display: 'flex', alignItems: "flex-end", justifyContent: 'flex-end', mb: 1 }}>
							<ul style={{margin: 0, padding: 0, width: '70%', maxWidth: '500px', marginRight: '10px'}}>
								<li style={{listStyleType: 'none'}}>
									<Typography sx={{mr: 0, textAlign: 'right'}}>You</Typography>
								</li>
								<li style={{listStyleType: 'none'}}>
									<Paper sx={{ ml: 1, background: 'rgb(240, 246, 233)' }}>
										<Typography sx={{ p: 1 }}>{message.text}</Typography>
									</Paper>
								</li>
							</ul>
						</Box>
					)
				} else {
					return (
						<Box key={message.id} sx={{ display: 'flex', alignItems: "flex-start", justifyContent: 'flex-start', mb: 1 }}>
							<ul style={{margin: 0, padding: 0, width: '70%', maxWidth: '500px', marginRight: '10px'}}>
								<li style={{listStyleType: 'none'}}>
									<Typography sx={{ml: 1}}>{message.name}</Typography>
								</li>
								<li style={{listStyleType: 'none'}}>
									<Paper sx={{ ml: 1, background: 'rgb(233, 240, 243)' }}>
										<Typography sx={{ p: 1 }}>{message.text}</Typography>
									</Paper>
								</li>
							</ul>
						</Box>
					)
				}
			})}
			{/* <div className='message_status'>
				<p>Someone is typing...</p>
			</div> */}
		</>
	)
}

export default ChatBody
