import { Button, Input } from '@mui/material'
import { useState } from 'react'


const ChatFooter = ({ socket, user }) => {
	const [message, setMessage] = useState('')

	const handleTyping = () => socket.emit('typing', `${user.name} is typing...`)

	const handleSendMessage = (e) => {
		e.preventDefault()
		if (message.trim() && user) {
			console.log('user:', user)
			socket.emit('message', {
				text: message,
				name: user.name,
				id: `${socket.id}${Math.random()}`,
				socketID: socket.id
			})
		}
		setMessage('')
	}

	return (
		<div className='chat_footer'>
			<form className='form' onSubmit={handleSendMessage}>
				<Input
					type='text'
					placeholder='Type a message'
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					onKeyDown={handleTyping}
				/>
				<Button type='submit'>Send</Button>
			</form>
		</div>
	)
}

export default ChatFooter
