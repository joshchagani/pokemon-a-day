const KILOGRAM_TO_POUND = 2.20462
const METER_TO_FEET = 3.28084

export const gramsToPounds = (weight: number): string => {
	const conversion = weight * KILOGRAM_TO_POUND
	const toFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

	return toFormat.format(conversion)
}

export const metricToFeet = (meters: number): number => {
	const conversion = meters * METER_TO_FEET
	return parseFloat(conversion.toFixed(2))
}
