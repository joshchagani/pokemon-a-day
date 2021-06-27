import { gql } from '@apollo/client'

export const GET_POKEMONS = gql`
  query GetPokemons {
    pokemon_v2_pokemonspeciesname(
      where: { pokemon_v2_language: { name: { _eq: "en" } } }
    ) {
      name
      pokemon_v2_pokemonspecy {
        order
        pokemon_v2_pokemoncolor {
          name
        }
      }
    }
  }
`
