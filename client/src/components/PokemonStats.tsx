import React from 'react'
import styled from 'styled-components'
import { removeHyphens } from '../utils'

interface IPokemonStats {
	abilities: string[]
	baseExperience: number
	height: number
	weight: string
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
				<p>Base:</p>
				<p>{baseExperience} exp</p>
			</GridItem>
			<GridItem>
				<p>Height:</p>
				<p>{height} ft</p>
			</GridItem>
			<GridItem>
				<p>Weight:</p>
				<p>{weight} lbs</p>
			</GridItem>
			<GridItem>
				<p>Abilities:</p>
				<div>
					{abilities.map((ability: string, idx: number) => (
						<UpperCase key={`pokemon-ability-key-${idx}`}>
							{removeHyphens(ability)}
						</UpperCase>
					))}
				</div>
			</GridItem>
		</Container>
	)
}

const Container = styled.div`
	display: block;
	margin-inline-start: auto;
	margin-inline-end: auto;

	@media screen and (orientation: landscape) and (max-height: 400px) {
		margin-inline-start: initial;
	}
`

const GridItem = styled.div`
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 10px;
`

const UpperCase = styled.p`
	&::first-letter {
		text-transform: uppercase;
	}
`

export default PokemonStats
