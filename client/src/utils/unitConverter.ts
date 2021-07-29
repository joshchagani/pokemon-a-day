const GRAM_TO_POUND = 0.220462
const METER_TO_FEET = 3.28084

export const gramsToPounds = (grams: number): number => {
	const conversion = grams * GRAM_TO_POUND
	const toFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
	return parseFloat(toFormat.format(conversion))
}

export const metricToFeet = (meters: number): number => {
	const conversion = (meters / 10) * METER_TO_FEET
	return parseFloat(conversion.toFixed(2))
}
