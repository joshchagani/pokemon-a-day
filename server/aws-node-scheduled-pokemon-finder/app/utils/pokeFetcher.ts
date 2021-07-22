import {
	ApolloClient,
	InMemoryCache,
	NormalizedCacheObject,
	ApolloQueryResult,
} from '@apollo/client/core'
import { GET_POKEMONS } from '../queries/pokemonQuery'
import 'cross-fetch/polyfill'

const GRAPHQL_URL = 'https://beta.pokeapi.co/graphql/v1beta'

const client = new ApolloClient<NormalizedCacheObject>({
	uri: GRAPHQL_URL,
	cache: new InMemoryCache(),
})

interface IPokemonApollo {
	pokemon_v2_pokemonspeciesname: ApolloQueryResult<any>
}

export async function invokeFetchPokemon(
	pokemonId: number,
): Promise<IPokemonApollo> {
	const { data } = await client.query({
		query: GET_POKEMONS,
		variables: { id: pokemonId },
	})
	return data
}
