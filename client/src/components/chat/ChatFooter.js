import { Button, Input } from '@mui/material'
import { useState } from 'react'
import { useSelector } from 'react-redux'


const ChatFooter = ({ socket, user }) => {
	const [message, setMessage] = useState('')
	const room = useSelector(state => state.room)

	if (room === '') return null

	const handleSendMessage = (e) => {
		e.preventDefault()
		if (message.trim() && user) {
			console.log('user:', user)
			socket.emit('send_message', {
				text: message,
				name: user.name,
				room: room,
				// socketID: socket.id
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
				/>
				<Button type='submit'>Send</Button>
			</form>
		</div>
	)
}

export default ChatFooter
