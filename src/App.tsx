import React, { createContext, useEffect, useState } from 'react'
import { useMachine } from '@xstate/react'
import { animated as a, useSpring, useTransition, config } from 'react-spring'
import styled from 'styled-components'
import { pokemonMachine } from './machine/uiMachine'
import PokemonSprite from './components/PokemonSprite'
import PokemonStats from './components/PokemonStats'
import initialContext from './machine/initialContext'
import { POKEMON_COLORS } from './utils'
import type { IPokemonProvider, IPokemonContext } from './interfaces/Pokemon'

interface AppProps {}

export const MachineProvider = createContext<IPokemonProvider>({
	pokemonInfo: {
		...initialContext,
	},
})

function App({}: AppProps) {
	const [current] = useMachine(pokemonMachine)
	const [imageState, setImageState] = useState<string>('not-loaded')
	const ctx: IPokemonContext = (current.context as IPokemonProvider).pokemonInfo
	const backgroundSpring = useSpring({
		backgroundColor: `${
			current.matches('present')
				? POKEMON_COLORS.get(ctx.color.toLowerCase())
				: 'white'
		}`,
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
								<div>
									<PokemonName>
										#{ctx.pokemonId} - {ctx.name}
									</PokemonName>
									<PokemonSprite
										id={ctx.pokemonId as number}
										name={ctx.name as string}
										spriteUrl={ctx.spriteUrl as string}
									/>
								</div>
								<PokemonStats
									abilities={ctx.abilities}
									baseExperience={ctx.baseExperience}
									height={ctx.height}
									weight={ctx.weight}
								/>
							</SpriteContainer>
						),
				)}
			</Main>
		</MachineProvider.Provider>
	)
}

const Main = styled(a.main)`
	display: flex;
	min-block-size: 100vh;
	min-inline-size: 100vw;
	background-color: var(--bg-loading);
	color: white;
	align-items: center;
	justify-content: center;
`

const SpriteContainer = styled(a.section)`
	display: grid;
	inline-size: min(800px, 90%);
	grid-template-columns: 1fr;
	grid-template-rows: min-content auto;
	grid-template-areas: 'pokemon-name' 'pokemon-stats';

	@media screen and (orientation: landscape) and (max-height: 400px) {
		inline-size: 100%;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr;
		gap: 20px;
		h1,
		p {
			margin-block-start: 0;
		}
	}
`

const PokemonName = styled.h1`
	font-size: min(2em, 7vw);
	text-align: center;
`

export default App
