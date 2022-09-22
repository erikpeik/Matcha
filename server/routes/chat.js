module.exports = (http) => {
	const socketIO = require('socket.io')(http, {
		cors: {
			origin: "http://localhost:3000"
		}
	});

	socketIO.on('connection', (socket) => {
		console.log('socket connected:', socket.id);

		socket.on('message', (data) => {
			socketIO.emit('messageResponse', data)
		})

		socket.on('disconnect', () => {
			console.log('socket disconnected: ', socket.id);
		})
	})

	socketIO.on("connect_error", (err) => {
		console.log(`connect_error due to ${err.message}`);
	})
}
