export default function twFocusClass(hasRing = false) {
	if (!hasRing) {
		return 'focus:outline-hidden'
	}
	return 'focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 dark:focus:ring-offset-0'
}
