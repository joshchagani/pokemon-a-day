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
									<PokemonSprite
										id={ctx.pokemonId as number}
										name={ctx.name as string}
										spriteUrl={ctx.spriteUrl as string}
									/>
									<PokemonId>
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
									</PokemonId>
									<PokemonInfo>
										<PokemonStats
											abilities={ctx.abilities}
											baseExperience={ctx.baseExperience}
											height={ctx.height}
											weight={ctx.weight}
										/>
									</PokemonInfo>
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
	min-inline-size: 100vw;
	background-color: var(--bg-loading);
	font-size: min(var(--main-font-size), 4vw);
`

const SpriteContainer = styled(a.section)`
	display: grid;
	align-items: start;
	grid-template-columns: 1fr;
	grid-template-rows: repeat(3, min-content);
	padding-inline: 10px;

	@media screen and (orientation: landscape) {
		font-size: min(var(--main-font-size), 4vh);
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: min-content max-content;
		align-items: start;
		// inline-size: 100%;
		// grid-template-rows: 1fr;
	}
`

const PokemonName = styled.h1`
	font-size: min(2em, 7vw);
	text-transform: capitalize;
`

const PokemonType = styled.h2`
	font-size: min(1em, 4vw);
`

const PokemonId = styled.div`
	grid-column: 1 / -1;
	grid-row: 1 / span 1;
	text-align: center;

	@media screen and (orientation: landscape) {
		align-self: end;
		grid-column: 2 / -1;
		grid-row: 1 / span 1;
	}
`

const PokemonInfo = styled.div`
	grid-column: 1 / -1;
	grid-row: 3 / -1;

	@media screen and (orientation: landscape) {
		grid-column: 2 / -1;
		grid-row: 2 / -1;
	}
`

export default App
