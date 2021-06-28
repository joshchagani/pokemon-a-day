import React, { createContext, useEffect } from 'react'
import { useMachine } from '@xstate/react'
import { animated as a, useSpring, useTransition, config } from 'react-spring'
import styled from 'styled-components'
import { pokemonMachine } from './machine/uiMachine'
import PokemonSprite from './components/PokemonSprite'

interface AppProps {}

export const MachineProvider = createContext(null)

function App({}: AppProps) {
	const [current] = useMachine(pokemonMachine)
	const ctx: any = current.context
	const background = useSpring({
		backgroundColor: `${current.matches('present') ? 'green' : 'black'}`,
	})

	const spriteEnter = useTransition(current.matches('present'), {
		from: { opacity: 0 },
		enter: { opacity: 1 },
		leave: { opacity: 0 },
		delay: 1000,
		config: config.molasses,
	})

	return (
		<MachineProvider.Provider value={ctx}>
			<Main style={background}>
				<h1>Main main main</h1>
				<p>{JSON.stringify(current.value)}</p>
				<p>{JSON.stringify(ctx)}</p>
				{spriteEnter(
					(styles, item) =>
						item && (
							<SpriteContainer style={styles}>
								<PokemonSprite
									id={ctx.pokemonInfo.pokemonId as number}
									name={ctx.pokemonInfo.name as string}
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
`

const SpriteContainer = styled(a.section)`
	inline-size: 80%;
`

export default App
