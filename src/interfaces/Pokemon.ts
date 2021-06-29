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
}

export interface IPokemonContext {
	name: string
	pokemonId: number
	color: string
	spriteUrl: string
	totalPokemon: number
	progress: number
}

export interface IPokemon {
	pokemon_v2_pokemonspeciesname: ApolloQueryResult<any>
}

export interface IPokemonSprite {
	id: number
	name: string
	spriteUrl: string
}
