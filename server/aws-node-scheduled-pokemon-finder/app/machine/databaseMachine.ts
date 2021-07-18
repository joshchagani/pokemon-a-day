import { assign, createMachine } from 'xstate'
import { mongooseConnect, mongooseDisconnect } from '../model'

interface DatabaseContext {}

type DatabaseState =
	| { value: 'connect'; context: {} }
	| { value: 'write'; context: {} }
	| { value: 'disconnect'; context: {} }
	| { value: 'pause'; context: {} }
	| { value: 'failure'; context: {} }

export const databaseMachine = createMachine<
	DatabaseContext,
	any,
	DatabaseState
>({
	id: 'database-machine',
	initial: 'connect',
	states: {
		connect: {
			invoke: {
				id: 'connect-to-db',
				src: mongooseConnect,
				onDone: {
					target: 'disconnect',
					actions: () => {
						console.log('👌 connected!')
					},
				},
				onError: {
					target: 'failure',
					actions: (_, event) => {
						console.log('😱 nope', event.data)
					},
				},
			},
		},
		write: {},
		disconnect: {
			invoke: {
				id: 'disconnect-from-db',
				src: () => mongooseDisconnect(),
				onDone: {
					target: 'pause',
					actions: () => {
						console.log('❌ disconnected!')
					},
				},
				onError: {
					target: 'failure',
				},
			},
		},
		pause: {},
		failure: {},
	},
})
