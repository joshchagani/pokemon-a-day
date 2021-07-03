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
							'getAbilities',
							'getBaseExperience',
							'getColor',
							'getHeight',
							'getName',
							'getSpriteUrl',
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
					const abilities =
						event.data.pokemon_v2_pokemonspeciesname[0].pokemon_v2_pokemonspecy.pokemon_v2_pokemons[0].pokemon_v2_pokemonabilities.map(
							(ability: any) => {
								const splitWords = ability.pokemon_v2_ability.name
									.split('-')
									.map(
										(s: string) => s.charAt(0).toUpperCase() + s.substring(1),
									)
								return splitWords.join(' ')
							},
						)
					return abilities
				},
			}),
			getBaseExperience: assign({
				baseExperience: (_, event) =>
					event.data.pokemon_v2_pokemonspeciesname[0].pokemon_v2_pokemonspecy
						.pokemon_v2_pokemons[0].base_experience,
			}),
			getColor: assign({
				color: (_, event) =>
					event.data.pokemon_v2_pokemonspeciesname[0].pokemon_v2_pokemonspecy
						.pokemon_v2_pokemoncolor.name,
			}),
			getHeight: assign({
				height: (_, event) =>
					event.data.pokemon_v2_pokemonspeciesname[0].pokemon_v2_pokemonspecy
						.pokemon_v2_pokemons[0].height,
			}),
			getName: assign({
				name: (_, event) => event.data.pokemon_v2_pokemonspeciesname[0].name,
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
			getWeight: assign({
				weight: (_, event) =>
					event.data.pokemon_v2_pokemonspeciesname[0].pokemon_v2_pokemonspecy
						.pokemon_v2_pokemons[0].weight,
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
			pokemon_v2_pokemonspeciesname: [
				{
					name: 'Murkrow',
					pokemon_species_id: 198,
					pokemon_v2_pokemonspecy: {
						pokemon_v2_pokemoncolor: {
							name: 'black',
						},
						pokemon_v2_pokemons: [
							{
								base_experience: 81,
								height: 5,
								weight: 21,
								pokemon_v2_pokemonabilities: [
									{
										pokemon_v2_ability: {
											name: 'insomnia',
										},
									},
									{
										pokemon_v2_ability: {
											name: 'super-luck',
										},
									},
									{
										pokemon_v2_ability: {
											name: 'prankster',
										},
									},
								],
							},
						],
					},
				},
			],
		}),
	)
}

function invokePokePicker(maxNumber: number): number {
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
	console.log('pokemon number', newNum)
	return newNum
}
