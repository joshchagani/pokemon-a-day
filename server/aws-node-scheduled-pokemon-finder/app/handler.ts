import { Context } from 'aws-lambda'
import { interpret } from 'xstate'
import { databaseMachine } from './machine'
import dotenv from './env-config'

export const run = async (event: any, context: Context) => {
	context.callbackWaitsForEmptyEventLoop = false
	await dotenv
	const time = new Date()
	console.log(`Your cron function "${context.functionName}" ran at ${time}`)
	await setupMachine()
}

async function setupMachine(): Promise<void> {
	return new Promise((resolve) => {
		const databaseService = interpret(databaseMachine)
		databaseService.subscribe((state) => console.log('🌏 state', state.value))
		databaseService.start()
		databaseService.onDone(() => resolve())
	})
}
