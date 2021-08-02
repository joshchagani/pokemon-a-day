import type { IPokemonContext } from '../interfaces/Pokemon'

const initialContext: IPokemonContext = {
	name: '',
	color: '',
	spriteUrl: '',
	totalPokemon: 0,
	pokemonId: 0,
	progress: 0,
	baseExperience: 0,
	height: 0,
	weight: '',
	abilities: ['', ''],
	types: ['', ''],
	game: 'red-blue',
}

export default initialContext
