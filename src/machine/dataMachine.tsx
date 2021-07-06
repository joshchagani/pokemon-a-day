import { assign, createMachine } from 'xstate'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { DateTime } from 'luxon'
import { dateSubstringer, upperCaser } from '../utils'
import { GET_POKEMONS } from '../queries/pokemonQuery'
import initialContext from './initialContext'
import type { IPokemon, IPokemonContext } from '../interfaces/Pokemon'

const FALLBACK_TOTAL_POKEMON_COUNT = 898
const FALLBACK_TOTAL_POKEMON_ID = 1
const GRAPHQL_URL = 'https://beta.pokeapi.co/graphql/v1beta'
const POKEMON_COUNT_URL = 'https://pokeapi.co/api/v2/pokemon-species/?limit=0'

const client = new ApolloClient({
	uri: GRAPHQL_URL,
	cache: new InMemoryCache(),
})

interface IPokemonStateSchema {
	states: {
		pokeCounter: {}
		pokePicker: {}
		pause: {}
		query: {}
		success: {}
		failure: {}
	}
}

export const createPokemonDataMachine = createMachine<IPokemonContext>(
	{
		id: 'pokemon-data',
		initial: 'pokeCounter',
		// initial: 'mockCounter',
		context: {
			...initialContext,
		},
		states: {
			mockCounter: {
				invoke: {
					src: 'getMockPokemon',
					onDone: {
						actions: [
							assign({
								pokemonId: (_) => 25,
							}),
							'getAbilities',
							'getBaseExperience',
							'getColor',
							'getHeight',
							'getName',
							'getSpriteUrl',
							'getTypes',
							'getWeight',
						],
						target: 'success',
					},
				},
			},
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
			query: {
				invoke: {
					id: 'fetch-pokemon-data',
					src: 'getPokemon',
					onDone: {
						target: 'success',
						actions: [
							'getAbilities',
							'getBaseExperience',
							'getColor',
							'getHeight',
							'getName',
							'getSpriteUrl',
							'getTypes',
							'getWeight',
							assign({
								progress: (_) => 100,
							}),
						],
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
			getMockPokemon: () => invokeMockFetch,
		},
		actions: {
			getAbilities: assign({
				abilities: (_, event) => {
					interface IAbility {
						pokemon_v2_ability: {
							name: string
						}
					}
					const abilities =
						event.data.pokemon_v2_pokemon[0].pokemon_v2_pokemonabilities.map(
							(ability: IAbility) => ability.pokemon_v2_ability.name,
						)
					return abilities
				},
			}),
			getBaseExperience: assign({
				baseExperience: (_, event) =>
					event.data.pokemon_v2_pokemon[0].base_experience,
			}),
			getColor: assign({
				color: (_, event) =>
					event.data.pokemon_v2_pokemon[0].pokemon_v2_pokemonspecy
						.pokemon_v2_pokemoncolor.name,
			}),
			getHeight: assign({
				height: (_, event) => event.data.pokemon_v2_pokemon[0].height,
			}),
			getName: assign({
				name: (_, event) => event.data.pokemon_v2_pokemon[0].name,
			}),
			getRandomId: assign({
				pokemonId: (context) => invokePokePicker(context.totalPokemon),
			}),
			getSpriteUrl: assign({
				spriteUrl: (context) => {
					// Other possible sprite options
					// https://img.pokemondb.net/sprites/bank/normal/chimchar.png
					// https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png
					return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${context.pokemonId}.png`
				},
			}),
			getTypes: assign({
				types: (_, event) => {
					interface IType {
						pokemon_v2_type: {
							name: string
						}
					}
					const types =
						event.data.pokemon_v2_pokemon[0].pokemon_v2_pokemontypes.map(
							(type: IType) => upperCaser(type.pokemon_v2_type.name),
						)
					event.data.pokemon_v2_pokemon[0].weight
					return types
				},
			}),
			getWeight: assign({
				weight: (_, event) => event.data.pokemon_v2_pokemon[0].weight,
			}),
		},
		guards: {
			isIdDetermined: (context) => context.pokemonId > 0,
		},
	},
)

async function invokeFetchPokemonCount(): Promise<number> {
	const response = await fetch(POKEMON_COUNT_URL)
	const { count } = await response.json()
	return count
}

async function invokeFetchPokemon(pokemonId: number): Promise<IPokemon> {
	const { data } = await client.query({
		query: GET_POKEMONS,
		variables: { id: pokemonId },
	})
	return data
}

function invokeMockFetch(): Promise<any> {
	return new Promise((resolve, reject) =>
		resolve({
			pokemon_v2_pokemon: [
				{
					name: 'pikachu',
					base_experience: 112,
					height: 4,
					weight: 60,
					pokemon_species_id: 25,
					pokemon_v2_pokemonspecy: {
						pokemon_v2_pokemoncolor: {
							name: 'red',
						},
					},
					pokemon_v2_pokemonabilities: [
						{
							pokemon_v2_ability: {
								name: 'static',
							},
						},
						{
							pokemon_v2_ability: {
								name: 'lightning-rod',
							},
						},
					],
					pokemon_v2_pokemontypes: [
						{
							pokemon_v2_type: {
								name: 'electric',
							},
						},
					],
				},
			],
		}),
	)
}

function invokePokePicker(maxNumber: number): number {
	const dateTimeLocal = DateTime.now()
	const year = dateTimeLocal.year
	const month = dateTimeLocal.month
	const day = dateTimeLocal.day
	const ts = DateTime.utc(year, month, day).toMillis()
	let indexer = 5
	let newNum = ts
	while (newNum > maxNumber) {
		newNum = parseInt(ts.toString().substring(indexer, indexer + 3))
	}
	console.log('local', dateTimeLocal)
	console.log('UTC', ts)
	console.log('pokemon number', newNum)
	return newNum
}
