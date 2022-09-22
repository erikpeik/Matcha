import { Button, Input } from '@mui/material'
import { useState } from 'react'
import { useSelector } from 'react-redux'

const ChatFooter = ({ socket }) => {
	const [message, setMessage] = useState('')
	const user = useSelector(state => state.user)
	const handleSendMessage = (e) => {
		e.preventDefault()
		if (message.trim() && user) {
			console.log('user:', user)
			socket.emit('message', {
				text: message,
				name: user.user,
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
				/>
				<Button type='submit'>Send</Button>
			</form>
		</div>
	)
}

export default ChatFooter
