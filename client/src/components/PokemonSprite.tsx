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
	inline-size: min(100%, 50vh);
	block-size: auto;
	margin-inline-start: auto;
	margin-inline-end: auto;
	aspect-ratio: 1/1;
`

export default PokemonSprite
