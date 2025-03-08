import { BOARD_SIZE } from './constants.js';

export function isCoordinateOnBoard(row, col) {
	return (
		Number.isInteger(row) &&
		Number.isInteger(col) &&
		row >= 0 &&
		row < BOARD_SIZE &&
		col >= 0 &&
		col < BOARD_SIZE
	);
}

// Shake animation
export const shakeElement = (element, duration = 200, shakeDistance = 5) => {
	element.style.transition = `transform ${duration / 4}ms ease-in-out`;
	element.style.transform = `translateX(${shakeDistance}px)`;
	// element.style.borderColor = 'red';

	setTimeout(() => {
		element.style.transform = `translateX(-${shakeDistance}px)`;
		setTimeout(() => {
			element.style.transform = `translateX(${shakeDistance / 2}px)`;
			setTimeout(() => {
				element.style.transform = `translateX(-${shakeDistance / 2}px)`;
				setTimeout(() => {
					element.style.transform = `translateX(0)`;
					element.style.transition = ''; // Remove transition for future changes if needed.
					// element.style.borderColor = '#eab308'; // Remove transition for future changes if needed.
				}, duration / 4);
			}, duration / 4);
		}, duration / 4);
	}, duration / 4);
};
