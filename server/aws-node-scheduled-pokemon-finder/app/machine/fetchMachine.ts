// import { assign, createMachine } from 'xstate'

// export const pokemonMachine = createMachine<any>({
// 	id: 'pokemon-machine',
// 	initial: 'gather',
// 	context: {
// 		pokemonInfo: {},
// 		dataRef: null,
// 	},
// 	states: {
// 		idle: {
// 			after: {
// 				1000: { target: 'gather' },
// 			},
// 		},
// 		gather: {
// 			invoke: {
// 				id: 'pokemon-data-machine',
// 				src: createPokemonDataMachine,
// 				onDone: {
// 					target: 'present',
// 					actions: assign({
// 						pokemonInfo: (_, event) => event.data,
// 					}),
// 				},
// 			},
// 		},
// 		present: {},
// 	},
// })