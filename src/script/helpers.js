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
