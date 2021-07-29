import { connect, disconnect } from 'mongoose'

const uriBuilder = (envUser: string, envPass: string) =>
	'mongodb+srv://' +
	`${process.env[envUser]}:${process.env[envPass]}` +
	'@' +
	`${process.env.DB_CLUSTER}.${process.env.DB_URI}` +
	'/' +
	`${process.env.DB_NAME}` +
	'?retryWrites=true&w=majority'

export const mongooseConnect = async (
	envUser: string,
	envPass: string,
): Promise<any> => {
	const uri = uriBuilder(envUser, envPass)
	return await connect(uri, {
		useUnifiedTopology: true,
		useNewUrlParser: true,
		useCreateIndex: true,
	})
}

export const mongooseDisconnect = async () => disconnect()
