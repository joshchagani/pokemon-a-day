import React from 'react'
import styled from 'styled-components'

interface IPokemonStats {
	abilities: string[]
	baseExperience: number
	height: number
	weight: number
}

function PokemonStats({
	abilities = [''],
	baseExperience,
	height,
	weight,
}: IPokemonStats) {
	//
	return (
		<Container>
			<GridItem>
				<p>Base Experience</p>
				<p>{baseExperience}</p>
			</GridItem>
			<GridItem>
				<p>Height</p>
				<p>{height}"</p>
			</GridItem>
			<GridItem>
				<p>Weight</p>
				<p>{weight} lbs</p>
			</GridItem>
			<GridItem>
				<p>Abilities</p>
				<div>
					{abilities.map((ability: string, idx: number) => (
						<p key={`pokemon-ability-key-${idx}`}>{ability}</p>
					))}
				</div>
			</GridItem>
		</Container>
	)
}

const Container = styled.div`
	display: block;
	inline-size: min(600px, 100%);
	margin-inline-start: auto;
`

const GridItem = styled.div`
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 10px;
`

export default PokemonStats
