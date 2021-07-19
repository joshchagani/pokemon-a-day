import { assign, createMachine } from 'xstate'
import { mongooseConnect, mongooseDisconnect, PokemonModel } from '../model'
import { pokemonDataMachine, IPokemonContext } from './fetchMachine'
import 'cross-fetch/polyfill'

const POKEMON_COUNT_URL = 'https://pokeapi.co/api/v2/pokemon-species/?limit=0'
const FALLBACK_TOTAL_POKEMON_COUNT = 800

interface DatabaseContext {
	dbConnectionStatus: string
	pokemonInfo: IPokemonContext | { totalPokemon: number }
}

type DatabaseState =
	| {
			value: 'connect'
			context: DatabaseContext & { dbConnectionStatus: string }
	  }
	| {
			value: 'fetch'
			context: DatabaseContext & { pokemonInfo: { totalPokemon: number } }
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
			pokemonInfo: { totalPokemon: 0 },
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
										return { ...context.pokemonInfo, totalPokemon: event.data }
									},
								}),
							},
							onError: {
								actions: assign({
									pokemonInfo: (context) => {
										console.log('😬 fallback count')
										return {
											...context.pokemonInfo,
											totalPokemon: FALLBACK_TOTAL_POKEMON_COUNT,
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
						totalPokemon: (context) => context.pokemonInfo.totalPokemon,
					},
					onDone: {
						target: 'disconnect',
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
			write: {},
			disconnect: {
				invoke: {
					id: 'disconnect-from-db',
					src: () => mongooseDisconnect(),
					onDone: {
						target: 'pause',
						actions: () => console.log('❌ disconnected!'),
					},
					onError: {
						target: 'pause',
						actions: () => console.log('failure to disconnect'),
					},
				},
			},
			pause: {},
			failure: {},
		},
	},
	{
		guards: {
			isReadyToWrite: (context) =>
				context.dbConnectionStatus === 'connected' &&
				context.pokemonInfo.totalPokemon > 0,
		},
		services: {
			connectToDatabase: () => mongooseConnect,
			getTotalPokemonCount: (_) => invokeFetchPokemonCount,
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
