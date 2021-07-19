import { interpret } from 'xstate'
import { Handler, Context } from 'aws-lambda'
import { databaseMachine } from './machine'
import dotenv from '../env-config'

const databaseService = interpret(databaseMachine)
databaseService.subscribe((state) => console.log('🌏 state', state.value))

export const run = async (event: any, context: Context) => {
	context.callbackWaitsForEmptyEventLoop = false
	await dotenv
	const time = new Date()
	console.log(`Your cron function "${context.functionName}" ran at ${time}`)
	databaseService.start()
}
