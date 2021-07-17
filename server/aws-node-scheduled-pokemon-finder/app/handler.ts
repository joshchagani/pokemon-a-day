import { Handler, Context } from 'aws-lambda'
import { PokemonModel } from './model'

export async function run(event: any, context: Context) {
	context.callbackWaitsForEmptyEventLoop = false
	const time = new Date()
	console.log(`Your cron function "${context.functionName}" ran at ${time}`)
}
