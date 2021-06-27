import React from 'react'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { createMachine, assign } from 'xstate'
import { useMachine } from '@xstate/react'
import { GET_POKEMONS } from './queries/pokemonQuery'

interface AppProps {}
interface PokemonContext {
  sprite: string
  id: number | null
  name: string
  data: any
}

const GRAPHQL_URL = 'https://beta.pokeapi.co/graphql/v1beta'
const client = new ApolloClient({
  uri: GRAPHQL_URL,
  cache: new InMemoryCache(),
})

const pokemonMachine = createMachine<PokemonContext>({
  id: 'pokemon',
  initial: 'loading',
  context: {
    sprite: '',
    id: null,
    name: '',
    data: {},
  },
  states: {
    idle: {
      on: {
        FETCH: 'loading',
      },
    },
    loading: {
      invoke: {
        src: () => client.query({ query: GET_POKEMONS }),
        onError: 'error',
        onDone: {
          target: 'success',
          actions: assign({
            data: (_, event) => event.data.data,
          }),
        },
      },
    },
    success: {},
    error: {
      on: {
        RETRY: 'loading',
      },
    },
  },
})

function App({}: AppProps) {
  const [current, send] = useMachine(pokemonMachine)
  console.log('current', current)
  return (
    <main>
      <h1>Main main main</h1>
      <p>{JSON.stringify(current.value)}</p>
      <p>{JSON.stringify(current.context)}</p>
    </main>
  )
}

export default App
