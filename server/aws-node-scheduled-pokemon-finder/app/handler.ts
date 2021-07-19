import { createMachine, assign, interpret } from 'xstate'
import { Handler, Context } from 'aws-lambda'
import { databaseMachine } from './machine'
import dotenv from '../env-config'

export const run = async (event: any, context: Context) => {
	await dotenv
	context.callbackWaitsForEmptyEventLoop = false
	const time = new Date()
	console.log(`Your cron function "${context.functionName}" ran at ${time}`)
	const databaseService = interpret(databaseMachine)
	databaseService.subscribe((state) => console.log('🌏 state', state.value))
	databaseService.start()
}
