import { useSelector } from 'react-redux'
import { Button, Typography, Box, Paper, Avatar, Tooltip } from '@mui/material'

const ChatBody = ({ messages, user, typingStatus }) => {
	const profileData = useSelector(state => state.profile)
	// console.log('profileData:', profileData)
	if (profileData != null && Object.keys(profileData).length > 0)
		var profile_pic = profileData.profile_pic['picture_data']

	return (
		<>
			<div className='chat_mainHeader'>
				<Typography variant='h5'>Find your true love</Typography>
				<Button>Leave Chat</Button>
			</div>

			{messages.map(message => {
				if (message.name === user.name) {
					return (
						<Box key={message.id} sx={{ display: 'flex', alignItems: "flex-start", justifyContent: 'flex-end', mb: 1 }}>
							<Box sx={{ width: 3 / 4 }}>
								<Paper sx={{ ml: 1, background: 'rgb(240, 246, 233)' }}>
									<Typography sx={{ p: 1 }}>{message.text}</Typography>
								</Paper>
							</Box>
							<Box sx={{ ml: 1, mr: 1 }}>
								<Tooltip title={message.name}>
									<Avatar src={profile_pic} alt={message.name} />
								</Tooltip>
							</Box>
						</Box>
					)
				} else {
					return (
						<Box key={message.id} sx={{ display: 'flex', alignItems: "flex-start", justifyContent: 'flex-start', mb: 1 }}>
							<Box sx={{ ml: 1}}>
								<Tooltip title={message.name}>
									<Avatar src={profile_pic} alt={message.name} />
								</Tooltip>
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
