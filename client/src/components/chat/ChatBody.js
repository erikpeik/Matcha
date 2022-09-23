import { Button, Typography } from '@mui/material'

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
						<div key={message.id}>
							<p>You</p>
							<div>
								<p>{message.text}</p>
							</div>
						</div>
					)
				} else {
					return (
						<div key={message.id}>
						<p>{message.name}</p>
						<div>
							<p>{message.text}</p>
						</div>
					</div>
					)
				}
			})}
			<div className='message_status'>
				<p>Someone is typing...</p>
			</div>
		</>
	)
}

export default ChatBody
