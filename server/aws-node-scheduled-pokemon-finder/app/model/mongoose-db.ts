import { connect, disconnect } from 'mongoose'

const uri =
	'mongodb+srv://' +
	`${process.env.DB_USER}:${process.env.DB_PASSWORD}` +
	'@' +
	`${process.env.DB_CLUSTER}.${process.env.DB_URI}` +
	'/' +
	`${process.env.DB_NAME}` +
	'?retryWrites=true&w=majority'

export const mongooseConnect = async (): Promise<any> => {
	return await connect(uri, {
		useUnifiedTopology: true,
		useNewUrlParser: true,
		useCreateIndex: true,
	})
}

export const mongooseDisconnect = async () => disconnect()
