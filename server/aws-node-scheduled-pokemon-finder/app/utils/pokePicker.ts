import { DateTime } from 'luxon'

const TWO_DAYS = 2

interface IDatePicker {
	pokemonId: number
	dateEpochUTC: number
}

export function invokePokePicker(maxNumber: number): IDatePicker {
	const dateTimeTomorrow = DateTime.now().plus({ days: TWO_DAYS })
	const year = dateTimeTomorrow.year
	const month = dateTimeTomorrow.month
	const day = dateTimeTomorrow.day
	const dateEpochUTC = DateTime.utc(year, month, day).toMillis()
	let indexer = 5
	let pokemonId = dateEpochUTC
	while (pokemonId > maxNumber) {
		pokemonId = parseInt(
			dateEpochUTC.toString().substring(indexer, indexer + 3),
		)
		indexer--
	}
	return { pokemonId, dateEpochUTC }
}
