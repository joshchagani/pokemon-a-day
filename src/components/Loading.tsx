import React, { useContext, useEffect } from 'react'
import styled from 'styled-components'
import { useSpring, animated as a } from 'react-spring'
import Pikachu from '../assets/pikachu.png'
import { MachineProvider } from '../App'
import type { IPokemonProvider } from '../interfaces/Pokemon'

interface ILoading {}

function Loading({}: ILoading) {
	const context: IPokemonProvider = useContext(MachineProvider)
	const saturateSpring = useSpring({
		from: {
			filter: `saturate(0%)`,
		},
		filter: `saturate(${context.pokemonInfo.progress}%)`,
	})

	return (
		<LoadingContainer>
			<p>Loading</p>
			<LoadingImage src={Pikachu} style={saturateSpring} />
		</LoadingContainer>
	)
}

const LoadingContainer = styled.div`
	display: flex;
	flex-direction: column;
`

const LoadingImage = styled(a.img)`
	inline-size: 100px;
	block-size: 100px;
	display: block;
	object-fit: contain;
	margin-inline-start: auto;
	margin-inline-end: auto;
`

export default Loading
