import { gql } from '@apollo/client'

export const GET_POKEMONS = gql`
	query GetPokemon($id: Int) {
		pokemon_v2_pokemonspeciesname(
			where: {
				pokemon_species_id: { _eq: $id }
				pokemon_v2_language: { name: { _eq: "en" } }
			}
		) {
			name
			pokemon_species_id
			pokemon_v2_pokemonspecy {
				pokemon_v2_pokemoncolor {
					name
				}
			}
		}
	}
`
