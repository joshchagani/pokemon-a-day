import { assign, createMachine } from 'xstate'
import {
	mongooseConnect,
	mongooseDisconnect,
	PokemonModel,
	IPokemon,
} from '../../../model'
import { pokemonDataMachine } from './fetchMachine'
import { fetch } from 'cross-fetch'

const POKEMON_COUNT_URL = 'https://pokeapi.co/api/v2/pokemon-species/?limit=0'
const FALLBACK_TOTAL_POKEMON_COUNT = 800

interface DatabaseContext {
	dbConnectionStatus: string
	pokemonInfo: IPokemon | { currentTotalPokemon: number }
}

type DatabaseState =
	| {
			value: 'connect'
			context: DatabaseContext & { dbConnectionStatus: string }
	  }
	| {
			value: 'fetch'
			context: DatabaseContext & {
				pokemonInfo: { currentTotalPokemon: number }
			}
	  }
	| { value: 'write'; context: DatabaseContext }
	| { value: 'disconnect'; context: DatabaseContext }
	| { value: 'pause'; context: DatabaseContext }
	| { value: 'failure'; context: DatabaseContext }

export const databaseMachine = createMachine<
	DatabaseContext,
	any,
	DatabaseState
>(
	{
		id: 'database-machine',
		initial: 'initial',
		context: {
			dbConnectionStatus: 'waiting',
			pokemonInfo: { currentTotalPokemon: 0 },
		},
		states: {
			initial: {
				id: 'initial-connection',
				type: 'parallel',
				always: {
					target: 'determinePokemon',
					cond: 'isReadyToWrite',
				},
				states: {
					connect: {
						invoke: {
							id: 'connect-to-db',
							src: 'connectToDatabase',
							onDone: {
								actions: assign({
									dbConnectionStatus: (_) => {
										console.log('👌 connected!')
										return 'connected'
									},
								}),
							},
							onError: {
								actions: assign({
									dbConnectionStatus: (_, event) => {
										console.log('😱 nope', event.data)
										return 'connectionFailed'
									},
								}),
							},
						},
					},
					fetchCount: {
						invoke: {
							id: 'fetch-pokemon-count',
							src: 'getTotalPokemonCount',
							onDone: {
								actions: assign({
									pokemonInfo: (context, event) => {
										console.log('⚡️ pokemon count', event.data)
										return {
											...context.pokemonInfo,
											currentTotalPokemon: event.data,
										}
									},
								}),
							},
							onError: {
								actions: assign({
									pokemonInfo: (context) => {
										console.log('😬 fallback count')
										return {
											...context.pokemonInfo,
											currentTotalPokemon: FALLBACK_TOTAL_POKEMON_COUNT,
										}
									},
								}),
							},
						},
					},
				},
			},
			determinePokemon: {
				invoke: {
					id: 'determine-todays-pokemon',
					src: pokemonDataMachine,
					data: {
						currentTotalPokemon: (context: DatabaseContext) =>
							context.pokemonInfo.currentTotalPokemon,
					},
					onDone: {
						target: 'write',
						actions: assign({
							pokemonInfo: (_, event) => {
								console.log('📈 pokemon data', event.data)
								return event.data
							},
						}),
					},
					onError: {},
				},
			},
			write: {
				invoke: {
					id: 'writing-to-db',
					src: 'writePokemonData',
					onDone: {
						target: 'disconnect',
						actions: () => console.log('📝 write successful'),
					},
					onError: {
						target: 'disconnect',
						actions: () => console.log('💥 pokemon not saved'),
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
		guards: {
			isReadyToWrite: (context) =>
				context.dbConnectionStatus === 'connected' &&
				context.pokemonInfo.currentTotalPokemon > 0,
		},
		services: {
			connectToDatabase: () => mongooseConnect('DB_USER', 'DB_PASSWORD'),
			getTotalPokemonCount: (_) => invokeFetchPokemonCount,
			writePokemonData: (context) =>
				invokeDatabaseSave(context.pokemonInfo as IPokemon),
		},
	},
)

async function invokeFetchPokemonCount(): Promise<number> {
	const response = await fetch(POKEMON_COUNT_URL, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})
	const { count } = await response.json()
	return count
}

async function invokeDatabaseSave(pokemonInfo: IPokemon): Promise<any> {
	const pokemon = new PokemonModel(pokemonInfo)
	return await pokemon.save()
}
