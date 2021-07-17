import { assign, createMachine } from 'xstate'

interface DatabaseContext {}

type DatabaseState =
	| { value: 'connect'; context: {} }
	| { value: 'write'; context: {} }

const databaseMachine = createMachine<DatabaseContext, any, DatabaseState>({
	id: 'database-machine',
	initial: 'connect',
	states: {
		connect: {},
		write: {},
	},
})
