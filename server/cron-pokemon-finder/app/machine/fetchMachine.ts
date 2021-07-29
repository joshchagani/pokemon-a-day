import { createMachine, assign } from 'xstate'
import {
	invokePokePicker,
	invokeFetchPokemon,
	convertToMeters,
} from '../../../utils'
import { IPokemon } from '../../../model'

const FALLBACK_TOTAL_POKEMON_ID = 1

type PokemonState =
	| { value: 'mockPokemon'; context: IPokemon }
	| {
			value: 'pokeCounter'
			context: IPokemon & {
				totalPokemon: number
				progress: number
			}
	  }
	| {
			value: 'pokePicker'
			context: IPokemon & { progress: number; pokemonId: number }
	  }
	| { value: 'query'; context: IPokemon }
	| { value: 'pause'; context: IPokemon & {} }
	| { value: 'success'; context: IPokemon & {} }
	| { value: 'failure'; context: IPokemon & {} }

export const pokemonDataMachine = createMachine<IPokemon, any, PokemonState>(
	{
		id: 'pokemon-data',
		initial: 'pokePicker',
		// initial: 'mockPokemon',
		context: {
			currentTotalPokemon: 0,
			dateEpochUTC: 0,
			pokemonAbilities: [''],
			pokemonBaseExp: 0,
			pokemonColor: '',
			pokemonGameAppearances: [''],
			pokemonHeight: 0,
			pokemonId: 0,
			pokemonName: '',
			pokemonSpriteUrl: '',
			pokemonTypes: [''],
			pokemonWeight: 0,
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
							'getGameAppearances',
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
							'getGameAppearances',
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
							pokemonName: (_) => 'Bulbasaur',
							pokemonColor: (_) => 'green',
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
				pokemonAbilities: (_, event) => {
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
				pokemonBaseExp: (_, event) =>
					event.data.pokemon_v2_pokemon[0].base_experience,
			}),

			getColor: assign({
				pokemonColor: (_, event) =>
					event.data.pokemon_v2_pokemon[0].pokemon_v2_pokemonspecy
						.pokemon_v2_pokemoncolor.name,
			}),

			getGameAppearances: assign({
				pokemonGameAppearances: (_, event) => ['red-blue'],
			}),

			getHeight: assign({
				pokemonHeight: (_, event) =>
					convertToMeters(event.data.pokemon_v2_pokemon[0].height),
			}),

			getRandomId: assign((context) => {
				const { pokemonId, dateEpochUTC } = invokePokePicker(
					context.currentTotalPokemon,
				)
				return {
					pokemonId,
					dateEpochUTC,
				}
			}),

			getName: assign({
				pokemonName: (_, event) => event.data.pokemon_v2_pokemon[0].name,
			}),

			getSpriteUrl: assign({
				pokemonSpriteUrl: (context) => {
					// Other possible sprite options
					// https://img.pokemondb.net/sprites/bank/normal/chimchar.png
					// https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png
					return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${context.pokemonId}.png`
				},
			}),

			getTypes: assign({
				pokemonTypes: (_, event) => {
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
				pokemonWeight: (_, event) =>
					event.data.pokemon_v2_pokemon[0].weight / 10,
			}),
		},
		guards: {
			isIdDetermined: (context) => context.pokemonId > 0,
		},
	},
)

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
