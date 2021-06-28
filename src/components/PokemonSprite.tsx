import React, { useMemo } from 'react'
import styled from 'styled-components'
import type { IPokemonSprite } from '../interfaces/Pokemon'

const POKEMON_SPRITE = (id: number) =>
	// `https://pokeres.bastionbot.org/images/pokemon/${id}.png`
	`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`

// const POKEMON_SPRITE = (name: string) =>
// 	`https://img.pokemondb.net/sprites/bank/normal/${name.toLowerCase()}.png`

function PokemonSprite({ id, name }: IPokemonSprite) {
	const spriteUrl = useMemo(() => {
		return POKEMON_SPRITE(id)
	}, [id])
	return <Sprite src={spriteUrl} alt={name} title={name} />
}

const Sprite = styled.img`
	display: block;
	inline-size: 80%;
`

export default PokemonSprite
