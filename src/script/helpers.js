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
	// Validate element
	if (!element || !(element instanceof HTMLElement)) {
		console.error('Invalid element provided to scaleElement');
		return;
	}

	element.style.transition = `transform ${duration / 4}ms ease-in-out`;
	element.style.transform = `translateX(${shakeDistance}px)`;

	setTimeout(() => {
		element.style.transform = `translateX(-${shakeDistance}px)`;
		setTimeout(() => {
			element.style.transform = `translateX(${shakeDistance / 2}px)`;
			setTimeout(() => {
				element.style.transform = `translateX(-${shakeDistance / 2}px)`;
				setTimeout(() => {
					element.style.transform = `translateX(0)`;
					element.style.transition = ''; // Remove transition for future changes if needed.
				}, duration / 4);
			}, duration / 4);
		}, duration / 4);
	}, duration / 4);
};

export function getBufferZone(positions, size, direction) {
	const [row, col] = positions[0];
	const buffer = [];

	const startRow = Math.max(0, row - 1);
	const endRow = Math.min(
		BOARD_SIZE - 1,
		row + (direction === 'vertical' ? size : 1)
	);
	const startCol = Math.max(0, col - 1);
	const endCol = Math.min(
		BOARD_SIZE - 1,
		col + (direction === 'horizontal' ? size : 1)
	);

	for (let r = startRow; r <= endRow; r++) {
		for (let c = startCol; c <= endCol; c++) {
			if (
				isCoordinateOnBoard(r, c) &&
				!positions.some(([pr, pc]) => pr === r && pc === c)
			) {
				buffer.push([r, c]);
			}
		}
	}

	return buffer;
}

export function getSunkShipsBufferZone(sunkShips) {
	const totalBuffer = [];

	sunkShips.forEach((ship) => {
		const buffer = getBufferZone(ship.positions, ship.size, ship.direction);

		totalBuffer.push(buffer);
	});

	return new Set(totalBuffer.flat().map((coord) => JSON.stringify(coord)));
}

// Get surrounding coords horizontally
export function getSurroundingHorizontally(row, col, size) {
	const coords = [];

	for (let i = col - (size - 1); i < col + size; i++) {
		if (isCoordinateOnBoard(row, i)) {
			coords.push([row, i]);
		}
	}

	return coords;
}

// Get surrounding coords vertically
export function getSurroundingVertically(row, col, size) {
	const coords = [];

	for (let i = row - (size - 1); i < row + size; i++) {
		if (isCoordinateOnBoard(row, i)) {
			coords.push([i, col]);
		}
	}

	return coords;
}

export function groupCoordinates(coordinates, size) {
	if (coordinates.length < size || size < 2) {
		return [coordinates];
	}

	const groupedCoordinates = [];

	for (let i = 0; i <= coordinates.length - size; i++) {
		groupedCoordinates.push(coordinates.slice(i, i + size));
	}

	return groupedCoordinates;
}

export function groupedSurroundingCoordinates(row, col, size) {
	const horizontals = getSurroundingHorizontally(row, col, size);
	const verticals = getSurroundingVertically(row, col, size);

	return [
		...groupCoordinates(horizontals, size),
		...groupCoordinates(verticals, size),
	];
}
