import mongoose from 'mongoose'

const uri =
	'mongodb+srv://' +
	`${process.env.DB_USER}:${process.env.DB_PASSWORD}` +
	'@' +
	`${process.env.DB_CLUSTER}.${process.env.DB_URI}` +
	'/' +
	`${process.env.DB_NAME}` +
	'?retryWrites=true&w=majority'

export default mongoose.connect(
	uri,
	{
		useUnifiedTopology: true,
		useNewUrlParser: true,
	},
	() => {
		console.log('connected to database')
	},
)
