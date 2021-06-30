import { assign, createMachine } from 'xstate'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { dateSubstringer } from '../utils'
import { GET_POKEMONS } from '../queries/pokemonQuery'
import initialContext from './initialContext'
import type { IPokemon, IPokemonContext } from '../interfaces/Pokemon'

const FALLBACK_TOTAL_POKEMON_COUNT = 898
const FALLBACK_TOTAL_POKEMON_ID = 1
const GRAPHQL_URL = 'https://beta.pokeapi.co/graphql/v1beta'
const POKEMON_COUNT_URL = 'https://pokeapi.co/api/v2/pokemon-species/?limit=0'

// https://img.pokemondb.net/sprites/bank/normal/chimchar.png
// https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png

const client = new ApolloClient({
	uri: GRAPHQL_URL,
	cache: new InMemoryCache(),
})

const invokePokePicker = (maxNumber: number): number => {
	const date = new Date()
	date.setHours(0)
	date.setMinutes(0)
	date.setSeconds(0)
	date.setMilliseconds(0)
	let indexer = 5
	let newNum = dateSubstringer(date)
	while (newNum > maxNumber) {
		newNum = dateSubstringer(date, indexer--)
	}
	return newNum
}

const invokeFetchPokemonCount = async (): Promise<number> => {
	const response = await fetch(POKEMON_COUNT_URL)
	const { count } = await response.json()
	return count
}

const invokeFetchPokemon = async (pokemonId: number): Promise<IPokemon> => {
	const { data } = await client.query({
		query: GET_POKEMONS,
		variables: { id: pokemonId },
	})
	return data
}

export const createPokemonDataMachine = createMachine<IPokemonContext>(
	{
		id: 'pokemon-data',
		initial: 'pokeCounter',
		context: {
			...initialContext,
		},
		states: {
			pokeCounter: {
				invoke: {
					id: 'fetch-pokemon-count',
					src: 'getTotalPokemonCount',
					onDone: {
						target: 'pokePicker',
						actions: assign({
							totalPokemon: (_, event) => event.data,
							progress: (_) => 30,
						}),
					},
					onError: {
						target: 'failure',
						actions: assign({
							totalPokemon: (_) => FALLBACK_TOTAL_POKEMON_COUNT,
						}),
					},
				},
			},
			pokePicker: {
				id: 'random-pokemon-id',
				entry: 'getRandomId',
				always: {
					target: 'query',
					cond: 'isIdDetermined',
					actions: assign({ progress: (_) => 80 }),
				},
			},
			pause: {},
			query: {
				invoke: {
					id: 'fetch-pokemon-data',
					src: 'getPokemon',
					onDone: {
						target: 'success',
						actions: assign({
							name: (_, event) => {
								const pokemonName =
									event.data.pokemon_v2_pokemonspeciesname[0].name
								return pokemonName
							},
							color: (_, event) => {
								const pokemonColor =
									event.data.pokemon_v2_pokemonspeciesname[0]
										.pokemon_v2_pokemonspecy.pokemon_v2_pokemoncolor.name
								return pokemonColor
							},
							spriteUrl: (context) =>
								`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${context.pokemonId}.png`,
							progress: (_) => 100,
						}),
					},
					onError: {
						target: 'failure',
						actions: assign({
							name: (_) => 'Bulbasaur',
							color: (_) => 'green',
							pokemonId: (_) => FALLBACK_TOTAL_POKEMON_ID,
						}),
					},
				},
			},
			success: {
				type: 'final',
				data: (context) => context,
			},
			failure: {},
		},
	},
	{
		services: {
			getTotalPokemonCount: (_) => invokeFetchPokemonCount,
			getPokemon: (context) => invokeFetchPokemon(context.pokemonId),
		},
		actions: {
			getRandomId: assign({
				pokemonId: (context) => invokePokePicker(context.totalPokemon),
			}),
		},
		guards: {
			isIdDetermined: (context) => context.pokemonId > 0,
		},
	},
)
