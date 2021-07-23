export const removeHyphens = (str: string): string => str.replace(/-/g, ' ')

export const upperCaser = (str: string): string => {
	return str
		.split('-')
		.map((s: string) => s.charAt(0).toUpperCase() + s.substring(1))
		.join(' ')
}
