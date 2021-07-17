import { assign, createMachine } from 'xstate'
import { createPokemonDataMachine } from './dataMachine'

import initialContext from './initialContext'

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
					target: 'present',
					actions: assign({
						pokemonInfo: (_, event) => event.data,
					}),
				},
			},
		},
		present: {},
	},
})
