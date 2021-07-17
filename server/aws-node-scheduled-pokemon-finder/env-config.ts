import dotenv from 'dotenv'

export default async function ({ options, resolveConfigurationProperty }) {
	const envVars = dotenv.config({ path: '.env' }).parsed
	return Object.assign(
		{},
		envVars, // `dotenv` environment variables
		process.env, // system environment variables
	)
}
