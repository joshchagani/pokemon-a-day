import { Schema, model } from 'mongoose'

export interface IPokemon {
	currentTotalPokemon: number
	dateEpochUTC: number
	pokemonAbilities: string[]
	pokemonBaseExp: number
	pokemonColor: string
	pokemonGameAppearances: string[]
	pokemonHeight: number
	pokemonId: number
	pokemonName: string
	pokemonSpriteUrl: string
	pokemonTypes: string[]
	pokemonWeight: number
}

const pokemonSchema = new Schema<IPokemon>({
	currentTotalPokemon: Number,
	dateEpochUTC: { type: Number, index: true },
	pokemonAbilities: [{ type: String }],
	pokemonBaseExp: Number,
	pokemonColor: String,
	pokemonGameAppearances: [{ type: String }],
	pokemonHeight: Number,
	pokemonId: { type: Number, index: true },
	pokemonName: { type: String, index: true },
	pokemonSpriteUrl: String,
	pokemonTypes: [{ type: String }],
	pokemonWeight: Number,
})

export const PokemonModel = model<IPokemon>('Pokemon', pokemonSchema)
