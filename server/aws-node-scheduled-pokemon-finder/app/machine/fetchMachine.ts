import { assign, createMachine } from 'xstate'
import {
	ApolloClient,
	InMemoryCache,
	NormalizedCacheObject,
	ApolloQueryResult,
} from '@apollo/client/core'
import { DateTime } from 'luxon'
import { GET_POKEMONS } from '../queries/pokemonQuery'
import 'cross-fetch/polyfill'

const FALLBACK_TOTAL_POKEMON_ID = 1
const GRAPHQL_URL = 'https://beta.pokeapi.co/graphql/v1beta'

const client = new ApolloClient<NormalizedCacheObject>({
	uri: GRAPHQL_URL,
	cache: new InMemoryCache(),
})

interface IPokemon {
	pokemon_v2_pokemonspeciesname: ApolloQueryResult<any>
}

export interface IPokemonContext {
	name: string
	color: string
	spriteUrl: string
	totalPokemon: number
	pokemonId: number
	baseExperience: number
	height: number
	weight: number
	abilities: string[]
	types: string[]
	game: string
}

type PokemonState =
	| { value: 'mockPokemon'; context: IPokemonContext }
	| {
			value: 'pokeCounter'
			context: IPokemonContext & {
				totalPokemon: number
				progress: number
			}
	  }
	| {
			value: 'pokePicker'
			context: IPokemonContext & { progress: number; pokemonId: number }
	  }
	| { value: 'query'; context: IPokemonContext }
	| { value: 'pause'; context: IPokemonContext & {} }
	| { value: 'success'; context: IPokemonContext & {} }
	| { value: 'failure'; context: IPokemonContext & {} }

export const pokemonDataMachine = createMachine<
	IPokemonContext,
	any,
	PokemonState
>(
	{
		id: 'pokemon-data',
		initial: 'pokePicker',
		// initial: 'mockPokemon',
		context: {
			name: '',
			color: '',
			spriteUrl: '',
			totalPokemon: 0,
			pokemonId: 0,
			baseExperience: 0,
			height: 0,
			weight: 0,
			abilities: ['', ''],
			types: ['', ''],
			game: 'red-blue',
		},
		states: {
			mockPokemon: {
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
							'getFirstGameAppearance',
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
			pause: {},
			pokePicker: {
				id: 'random-pokemon-id',
				entry: 'getRandomId',
				always: {
					target: 'query',
					cond: 'isIdDetermined',
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
							'getFirstGameAppearance',
							'getHeight',
							'getName',
							'getSpriteUrl',
							'getTypes',
							'getWeight',
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
			getFirstGameAppearance: assign({
				game: (_, event) => 'red-blue',
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
							(type: IType) => type.pokemon_v2_type.name,
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
					pokemon_v2_pokemongameindices: [
						{
							pokemon_v2_version: {
								pokemon_v2_versiongroup: {
									name: 'red-blue',
								},
							},
						},
					],
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
		indexer--
	}
	console.log('⏱ UTC', ts)
	console.log('#️⃣ pokemon number', newNum)
	return newNum
}
