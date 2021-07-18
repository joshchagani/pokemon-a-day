import { gql } from '@apollo/client'

export const GET_POKEMONS = gql`
	query GetPokemon($id: Int) {
		pokemon_v2_pokemon(where: { pokemon_species_id: { _eq: $id } }, limit: 1) {
			name
			base_experience
			height
			weight
			pokemon_species_id
			pokemon_v2_pokemongameindices(limit: 1) {
				pokemon_v2_version {
					pokemon_v2_versiongroup {
						name
					}
				}
			}
			pokemon_v2_pokemonspecy {
				pokemon_v2_pokemoncolor {
					name
				}
			}
			pokemon_v2_pokemonabilities {
				pokemon_v2_ability {
					name
				}
			}
			pokemon_v2_pokemontypes {
				pokemon_v2_type {
					name
				}
			}
		}
	}
`
