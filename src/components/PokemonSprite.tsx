import React from 'react'
import styled from 'styled-components'
import type { IPokemonSprite } from '../interfaces/Pokemon'

function PokemonSprite({ id, name, spriteUrl }: IPokemonSprite) {
	return <Sprite src={spriteUrl} alt={name} title={name} data-pokemon-id={id} />
}

const Sprite = styled.img`
	display: block;
	inline-size: 100%;
`

export default PokemonSprite
