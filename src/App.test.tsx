import * as React from 'react'
import { render } from '@testing-library/react'
import { expect, assert } from 'chai'
import { interpret } from 'xstate'
import { pokemonMachine } from './machine/uiMachine'

import App from './App'

describe('<App>', () => {
	it('renders <main>', () => {
		render(<App />)
		const mainTag = document.querySelector('main')
		expect(mainTag?.tagName.toLocaleLowerCase()).to.equal('main')
	})
	it('populates pokemonInfo', (done) => {
		interpret(pokemonMachine)
			.onTransition((state) => {
				if (state.matches('present')) {
					assert.isNotEmpty((state.context as any).pokemonInfo)
					done()
				}
			})
			.start()
	})
})
