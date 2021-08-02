import type { ApolloQueryResult } from '@apollo/client'

interface IPokemonColor {
	pokemon_v2_pokemoncolor: {
		name: string
	}
}

interface IPokemonName {
	name: string
	pokemon_species_id: number
	pokemon_v2_pokemonspecy: IPokemonColor
	pokemon_v2_pokemons: IPokemonStats[]
}

interface IPokemonAbilities {
	pokemon_v2_ability: {
		name: string
	}
}

interface IPokemonGame {
	pokemon_v2_version: {
		pokemon_v2_versiongroup: {
			name: string
		}
	}
}

interface IPokemonGameIndices {
	pokemon_v2_pokemongameindices: IPokemonGame[]
}

interface IPokemonStats {
	base_experience: string
	height: string
	weight: string
	pokemon_v2_pokemonabilities: IPokemonAbilities[]
}

export interface IPokemonContext {
	name: string
	pokemonId: number
	color: string
	game: string
	spriteUrl: string
	totalPokemon: number
	progress: number
	baseExperience: number
	height: number
	weight: string
	abilities: string[]
	types: string[]
}

export interface IPokemonProvider {
	pokemonInfo: IPokemonContext
}

export interface IPokemon {
	pokemon_v2_pokemonspeciesname: ApolloQueryResult<IPokemonName>
}
