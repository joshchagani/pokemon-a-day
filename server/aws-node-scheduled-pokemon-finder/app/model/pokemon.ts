import { Schema, model } from 'mongoose'

interface IPokemon {
	pokemonId: number
	pokemonName: string
	pokemonType: string[]
	pokemonBaseExp: number
	pokemonHeight: number
	pokemonWeight: number
	pokemonAbilities: string[]
	currentTotalPokemon: number
	dateEpochUTC: number
}

const pokemonSchema = new Schema<IPokemon>({
	pokemonId: { type: Number, index: true },
	pokemonName: String,
	pokemonType: [{ type: String }],
	pokemonBaseExp: Number,
	pokemonHeight: Number,
	pokemonWeight: Number,
	pokemonAbilities: [{ type: String }],
	currentTotalPokemon: Number,
	dateEpochUTC: Number,
})

export const PokemonModel = model<IPokemon>('Pokemon', pokemonSchema)
