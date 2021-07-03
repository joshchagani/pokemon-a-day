export const dateSubstringer = (date: Date, indexer = 5) => {
	console.log('epoch', date.getTime())
	return parseInt(
		date
			.getTime()
			.toString()
			.substring(indexer, indexer + 3),
	)
}
