export const dateSubstringer = (date: Date, indexer = 5) => {
	return parseInt(
		date
			.getTime()
			.toString()
			.substring(indexer, indexer + 3),
	)
}
