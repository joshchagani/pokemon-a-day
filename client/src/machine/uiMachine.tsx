import { assign, createMachine } from 'xstate'
import { createPokemonDataMachine } from './dataMachine'


interface IPokemonMachineScheme {
	states: {
		idle: {}
		gather: {}
		present: {}
	}
}

export const pokemonMachine = createMachine<any>({
	id: 'pokemon-machine',
	initial: 'gather',
	context: {
		pokemonInfo: {},
		dataRef: null,
	},
	states: {
		pause: {},
		idle: {
			after: {
				500: { target: 'gather' },
			},
		},
		gather: {
			invoke: {
				id: 'pokemon-data-machine',
				src: createPokemonDataMachine,
				onDone: {
					target: 'tempFetch',
					actions: assign({
						pokemonInfo: (_, event) => event.data,
					}),
				},
			},
		},
		tempFetch: {
			invoke: {
				id: 'test-lambda',
				src: invokeLambdaTest,
				onDone: {
					target: 'present',
					actions: (_, event) => console.log(`🚧 lambda test - ${event.data}`),
				},
				onError: {
					target: 'present',
					actions: (_, event) => console.log(`🚧 lambda test - ${event.data}`),
				},
			},
		},
		present: {},
	},
	})

async function invokeLambdaTest(): Promise<any> {
	const dateEpoch = Date.now()
	const url = `https://api.todayspokemon.com?id=${dateEpoch}`
	const response = await fetch(url, {
		method: 'GET',
		mode: 'same-origin',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
	})
	return await response.json()
}
