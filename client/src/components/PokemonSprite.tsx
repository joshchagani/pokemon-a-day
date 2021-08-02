import React from 'react'
import styled from 'styled-components'
interface IPokemonSprite {
	id: number
	name: string
	spriteUrl: string
}

function PokemonSprite({ id, name, spriteUrl }: IPokemonSprite) {
	return (
		<Sprite
			src={spriteUrl}
			alt={name}
			title={name}
			data-pokemon-id={id}
			width="465"
			height="465"
		/>
	)
}

const Sprite = styled.img`
	display: block;
	inline-size: 100%;
	block-size: auto;
	margin-inline-start: auto;
	margin-inline-end: auto;
	aspect-ratio: 1/1;
	grid-column: 1 / -1;
	grid-row: 2 / span 1;

	@media screen and (orientation: landscape) {
		grid-column: 1 / span 1;
		grid-row: 1 / -1;
	}
`

export default PokemonSprite
