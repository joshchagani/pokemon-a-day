import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useSpring, animated as a } from 'react-spring'
import Pikachu from '../assets/pikachu.png'

interface ILoading {
	progress: number
}

function Loading({ progress = 0 }: ILoading) {
	const saturateSpring = useSpring({
		from: {
			filter: `saturate(${progress})`,
		},
		filter: `saturate(${progress})`,
	})

	useEffect(() => {
		console.log('progress', progress)
	}, [progress])

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
