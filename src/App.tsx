import React, { createContext } from 'react'
import { useMachine, useActor } from '@xstate/react'
import { animated as a, useSpring, useTransition, config } from 'react-spring'
import styled from 'styled-components'
import { pokemonMachine } from './machine/uiMachine'
import PokemonSprite from './components/PokemonSprite'
import Loading from './components/Loading'
import initialContext from './machine/initialContext'
import type { IPokemonProvider, IPokemonContext } from './interfaces/Pokemon'

import { mockMachine } from './machine/mockMachine'

interface AppProps {}

export const MachineProvider = createContext<IPokemonProvider>({
	pokemonInfo: {
		...initialContext,
	},
})

function App({}: AppProps) {
	const [current] = useMachine(pokemonMachine)
	const ctx: IPokemonContext = (current.context as IPokemonProvider).pokemonInfo
	const backgroundSpring = useSpring({
		backgroundColor: `${current.matches('present') ? ctx.color : 'white'}`,
	})

	const spriteEnter = useTransition(current.matches('present'), {
		from: { opacity: 0, transform: 'translate3d(0px, 30px, 0px)' },
		enter: { opacity: 1, transform: 'translate3d(0px, 0px, 0px)' },
		leave: { opacity: 0 },
		delay: 1000,
		config: config.molasses,
	})

	return (
		<MachineProvider.Provider value={current.context as IPokemonProvider}>
			<Main style={backgroundSpring}>
				{spriteEnter(
					(styles, item) =>
						item && (
							<SpriteContainer style={styles}>
								<PokemonName>{ctx.name}</PokemonName>
								<PokemonSprite
									id={ctx.pokemonId as number}
									name={ctx.name as string}
									spriteUrl={ctx.spriteUrl as string}
								/>
							</SpriteContainer>
						),
				)}
			</Main>
		</MachineProvider.Provider>
	)
}

const Main = styled(a.main)`
	inline-size: 100vw;
	block-size: 100vh;
	background-color: var(--bg-loading);
	color: white;
	display: grid;
	justify-content: space-evenly;
	justify-items: center;
	align-content: space-evenly;
	align-items: center;
`

const PokemonName = styled.h1`
	text-align: center;
`

const SpriteContainer = styled(a.section)`
	inline-size: 100%;
`

export default App
