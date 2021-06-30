import { assign, createMachine } from 'xstate'
import initialContext from './initialContext'

export const mockMachine = createMachine<any>({
	id: 'mock-machine',
	context: {
		...initialContext,
	},
	initial: 'idle',
	states: {
		pause: {},
		idle: {
			after: {
				3000: {
					target: 'gather',
					actions: assign({
						pokemonInfo: (context: any) => {
							console.log('setting progress to 50', context)
							return { ...context.pokemonInfo, progress: 50 }
						},
					}),
				},
			},
		},
		gather: {
			after: {
				2000: {
					target: 'finalize',
					actions: assign({
						pokemonInfo: (context: any) => {
							console.log('setting progress to 100', context)
							return { ...context.pokemonInfo, progress: 100 }
						},
					}),
				},
			},
		},
		finalize: {
			after: {
				2000: {
					target: 'present',
				},
			},
		},
		present: {},
	},
})
