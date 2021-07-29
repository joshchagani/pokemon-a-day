import { assign, createMachine, actions } from 'xstate'
import {
	mongooseConnect,
	mongooseDisconnect,
	PokemonModel,
	IPokemon,
} from '../../../model'

interface ApiContext {
	pokemonInfo: IPokemon
}

type ApiState =
	| {
			value: 'connect'
			context: ApiContext
	  }
	| { value: 'read'; context: ApiContext }
	| { value: 'disconnect'; context: ApiContext }
	| { value: 'pause'; context: ApiContext }
	| { value: 'failure'; context: ApiContext }

const { log } = actions

export const apiMachine = createMachine<ApiContext, any, ApiState>(
	{
		id: 'database-machine',
		context: {
			pokemonInfo: {
				currentTotalPokemon: undefined,
				dateEpochUTC: undefined,
				pokemonAbilities: undefined,
				pokemonBaseExp: undefined,
				pokemonColor: undefined,
				pokemonGameAppearances: undefined,
				pokemonHeight: undefined,
				pokemonId: undefined,
				pokemonName: undefined,
				pokemonSpriteUrl: undefined,
				pokemonTypes: undefined,
				pokemonWeight: undefined,
			},
		},
		initial: 'initial',
		states: {
			initial: {
				id: 'initial-connection',
				invoke: {
					id: 'connect-to-db',
					src: 'connectToDatabase',
					onDone: {
						target: 'read',
						actions: log(() => '👌 connected!', 'connection-label'),
					},
					onError: {
						target: 'failure',
						actions: log(
							(_: ApiContext, event) => `😱 nope - ${event.data}`,
							'connection-label',
						),
					},
				},
			},
			read: {
				invoke: {
					id: 'reading-from-db',
					src: 'readFromDatabase',
					onDone: {
						target: 'disconnect',
						actions: [
							log(
								(_: ApiContext, event) => `📓 read successful - ${event.data}`,
								'read-label',
							),
							assign({
								pokemonInfo: (context: ApiContext, event) => event.data,
							}),
						],
					},
					onError: {
						target: 'disconnect',
						actions: log(
							(_: ApiContext, event) => `🤯 pokemon not found - ${event.data}`,
							'read-label',
						),
					},
				},
			},
			disconnect: {
				invoke: {
					id: 'disconnect-from-db',
					src: () => mongooseDisconnect(),
					onDone: {
						target: 'success',
						actions: () => console.log('🔌 disconnected!'),
					},
					onError: {
						target: 'failure',
						actions: () => console.log('❌ failure to disconnect'),
					},
				},
			},
			pause: {},
			success: {
				type: 'final',
			},
			failure: {},
		},
	},
	{
		services: {
			connectToDatabase: () =>
				mongooseConnect('DB_READER_USER', 'DB_READER_PASSWORD'),
			readFromDatabase: async (context) => {
				const { dateEpochUTC } = context.pokemonInfo
				return await PokemonModel.findOne({ dateEpochUTC }).exec()
			},
		},
		actions: {},
	},
)
