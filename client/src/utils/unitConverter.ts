const KILOGRAM_TO_POUND = 2.20462
const METER_TO_FEET = 3.28084
const SHIFT_TO_KILOGRAM = 10

export const gramsToPounds = (weight: number): number => {
	const conversion = (weight / SHIFT_TO_KILOGRAM) * KILOGRAM_TO_POUND
	const toFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
	return parseFloat(toFormat.format(conversion))
}

export const metricToFeet = (meters: number): number => {
	const conversion = (meters / 10) * METER_TO_FEET
	return parseFloat(conversion.toFixed(2))
}
