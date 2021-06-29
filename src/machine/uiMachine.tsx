import { assign, createMachine } from 'xstate'
import { createPokemonDataMachine } from './dataMachine'

export const pokemonMachine = createMachine({
	id: 'pokemon-machine',
	context: {
		pokemonInfo: {},
	},
	initial: 'idle',
	states: {
		idle: {
			after: {
				1000: { target: 'gather' },
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
