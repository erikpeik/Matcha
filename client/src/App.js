import { useState } from 'react'
import Phonebook from './components/Phonebook'

const MainContainer = ({ windowState }) => {

	const submitUser = (event) => {
		event.preventDefault()
		console.log("Sending user data! Or not really...")

		// const oldNumber = persons.find(person => person.name === newName)
		// if (oldNumber) {
		// 	if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
		// 		const changedNumber = { ...oldNumber, number: newNumber }
		// 		nameService
		// 			.update(oldNumber.id, changedNumber)
		// 			.then(returnedName => {
		// 				setPersons(persons.map(person => person.name !== newName ? person : returnedName))
		// 			})
		// 			.catch(error => {
		// 				showMessage(`Information of '${newName}' has already been removed from server`, 'error')
		// 				setPersons(persons.filter(person => person.name !== newName))
		// 			})
		// 		showMessage(`Changed ${newName}'s number`, 'success')
		// 	}
		// } else {
		// 	const nameObject = { name: newName, number: newNumber }
		// 	nameService
		// 		.create(nameObject)
		// 		.then(returnedName => {
		// 			setPersons(persons.concat(returnedName))
		// 		})
		// 	showMessage(`Added ${newName}`, 'success')
		// }
	}

	if (windowState === 'signup') {
		return (
			<>
				<h2>{windowState}</h2>
				<form onSubmit={submitUser}>
					<br></br>
					<div><input type="text" name="username" defaultValue="Username"></input></div>
					<div><input type="text" name="firstname" defaultValue="First name"></input></div>
					<div><input type="text" name="lastname" defaultValue="Last name"></input></div>
					<div><input type="text" name="password" defaultValue="Password"></input></div>
					<div><input type="text" name="confirm_password" defaultValue="Confirm password"></input></div>
					<button type="submit">Submit</button>
				</form>
			</>
		)
	}
	return (
		<h2>{windowState}</h2>
	)
}

const Buttons = ({ setWindowState }) => {
	return (
		<>
			<button onClick={() => setWindowState('login')}>Log in</button>
			<button onClick={() => setWindowState('signup')}>Sign up</button>
			<button onClick={() => setWindowState('profile')}>Profile</button>
			<button onClick={() => setWindowState('browse_users')}>Browse users</button>
			<button onClick={() => setWindowState('browse_users')}>Chat</button>
			<button onClick={() => setWindowState('phonebook')}>Phonebook</button>
		</>
	)
}

const App = () => {
	const [windowState, setWindowState] = useState('phonebook')

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(position => {
		  console.log(position.coords.latitude);
		  console.log(position.coords.longitude);
		});
	}

	if (windowState === 'phonebook') {
		return (
			<div>
				<Buttons setWindowState={setWindowState} />
				<Phonebook />
			</div>
		)
	}

	return (
		<div>
			<Buttons setWindowState={setWindowState} />
			<MainContainer windowState={windowState} />
		</div>
	)
}

export default App