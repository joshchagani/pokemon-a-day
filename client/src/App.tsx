import React, { createContext, Suspense, lazy } from 'react'
import { useMachine } from '@xstate/react'
import { animated as a, useSpring, useTransition, config } from 'react-spring'
import styled from 'styled-components'
import { pokemonMachine } from './machine/uiMachine'
import initialContext from './machine/initialContext'
import { POKEMON_COLORS, removeHyphens } from './utils'
import type { IPokemonProvider, IPokemonContext } from './interfaces/Pokemon'

const PokemonSprite = lazy(() => import('./components/PokemonSprite'))
const PokemonStats = lazy(() => import('./components/PokemonStats'))

interface AppProps {}

export const MachineProvider = createContext<IPokemonProvider>({
	pokemonInfo: {
		...initialContext,
	},
})

function Loading({}: AppProps) {
	return <Main>Loading...</Main>
}

function App({}: AppProps) {
	const [current] = useMachine(pokemonMachine)
	const ctx: IPokemonContext = (current.context as IPokemonProvider).pokemonInfo
	const styleSpring = useSpring({
		backgroundColor: `${
			current.matches('present')
				? (POKEMON_COLORS.get(ctx.color.toLowerCase()) as any).hsl
				: 'white'
		}`,
		color: `${
			current.matches('present')
				? (POKEMON_COLORS.get(ctx.color.toLowerCase()) as any).fontColor
				: 'white'
		}`,
	})

	const spriteEnter = useTransition(current.matches('present'), {
		from: { opacity: 0, transform: 'translate3d(0px, 30px, 0px)' },
		enter: { opacity: 1, transform: 'translate3d(0px, 0px, 0px)' },
		leave: { opacity: 0 },
		delay: 500,
		config: config.molasses,
	})

	if (!current.matches('present')) return <Loading />
	return (
		<MachineProvider.Provider value={current.context as IPokemonProvider}>
			<Suspense fallback={<Loading />}>
				<Main style={styleSpring}>
					{spriteEnter(
						(styles, item) =>
							item && (
								<SpriteContainer style={styles}>
									<div>
										<PokemonName>
											#{ctx.pokemonId} {removeHyphens(ctx.name)}
										</PokemonName>
										<PokemonType>
											{ctx.types.map((type: string, idx: number) => (
												<span key={`pokemon-ability-key-${idx}`}>
													{ctx.types.length - 1 === idx ? type : `${type}, `}
												</span>
											))}
										</PokemonType>
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
			</Suspense>
		</MachineProvider.Provider>
	)
}

const Main = styled(a.main)`
	display: flex;
	align-items: center;
	justify-content: center;
	min-block-size: 100vh;
	min-inline-size: 100%;
	background-color: var(--bg-loading);
	font-size: min(var(--main-font-size), 4vw);
	padding-block-end: 1.5rem;

	@media screen and (min-width: 400px) {
		padding-block-start: 1rem;
	}
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

		h1,
		p {
			margin-block-start: 0;
			font-size: 1rem;
		}
	}
`

const PokemonName = styled.h1`
	font-size: min(2em, 7vw);
	text-align: center;
	text-transform: capitalize
`

const PokemonType = styled.h2`
	font-size: min(1em, 4vw);
	text-align: center;
`

export default App
