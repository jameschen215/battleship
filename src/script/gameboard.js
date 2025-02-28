import { Ship } from './ship';
import { BOARD_SIZE } from './constants.js';
import { isCoordinateOnBoard } from './helpers.js';

export class Cell {
	static STATES = ['empty', 'hit', 'miss'];
	#state = 'empty';

	get state() {
		return this.#state;
	}

	set state(newState) {
		if (!Cell.STATES.includes(newState)) {
			throw new Error('Cell state must be "empty", "hit", or "miss"');
		}

		this.#state = newState;
	}

	isAttacked() {
		return this.#state !== 'empty';
	}
}

export class Gameboard {
	static DIRECTIONS = ['horizontal', 'vertical'];

	#board = this.#createBoard();
	#ships = [];

	get board() {
		// Return a shallow copy to prevent direct mutation
		return this.#board.map((row) => [...row]);
	}

	get ships() {
		// Return a shallow copy to prevent direct mutation
		return [...this.#ships];
	}

	#createBoard() {
		const board = [];

		for (let row = 0; row < BOARD_SIZE; row++) {
			board[row] = [];
			for (let col = 0; col < BOARD_SIZE; col++) {
				board[row][col] = new Cell();
			}
		}

		return board;
	}

	placeShip(size, startRow, startCol, direction = 'horizontal') {
		// Check if coordinates are out of bounds
		if (!isCoordinateOnBoard(startRow, startCol)) {
			return {
				success: false,
				reason: 'Coordinates are not invalid or out of board boundaries',
			};
		}

		// direction must be "horizontal" or "vertical"
		if (!Gameboard.DIRECTIONS.includes(direction)) {
			return {
				success: false,
				reason: 'Directions must be "horizontal" or "vertical"',
			};
		}

		const ship = new Ship(size);
		const positions = [];

		for (let i = 0; i < size; i++) {
			let row = startRow + (direction === 'vertical' ? i : 0);
			let col = startCol + (direction === 'horizontal' ? i : 0);

			// Ship placement exceeds board boundaries
			if (row >= BOARD_SIZE || col >= BOARD_SIZE) {
				return {
					success: false,
					reason: 'Ship placement exceeds board boundaries',
				};
			}

			// TODO: There should be one cell wide gap in between ships
			// Ship placement overlaps with another ship
			if (
				this.#ships.some((shipObj) =>
					shipObj.positions.some(([r, c]) => r === row && c === col)
				)
			) {
				return {
					success: false,
					reason: 'Ship placement overlaps with another ship',
				};
			}

			positions.push([row, col]);
		}

		this.#ships.push({ ship, positions });

		return { success: true };
	}

	receiveAttack(row, col) {
		if (!isCoordinateOnBoard(row, col)) {
			return { hit: false, sunk: false, reason: 'invalid coordinate' };
		}

		const cell = this.#board[row][col];

		if (cell.isAttacked()) {
			return { hit: false, sunk: false, reason: 'attacked' };
		}

		for (const { ship, positions } of this.#ships) {
			if (positions.some(([r, c]) => r === row && c === col)) {
				ship.hit();
				cell.state = 'hit';
				return { hit: true, sunk: ship.isSunk() };
			}
		}

		cell.state = 'miss';
		return { hit: false, sunk: false };
	}

	allSunk() {
		if (this.#ships.length === 0) {
			return false;
		}

		return this.#ships.every(({ ship }) => ship.isSunk());
	}

	getCellState(row, col) {
		if (!isCoordinateOnBoard(row, col)) {
			throw new Error(
				`Coordinates must be integers between 0 and ${BOARD_SIZE - 1}`
			);
		}
		return this.#board[row][col].state;
	}

	isCellAttacked(row, col) {
		if (!isCoordinateOnBoard(row, col)) {
			throw new Error(
				`Coordinates must be integers between 0 and ${BOARD_SIZE - 1}`
			);
		}

		return this.#board[row][col].state !== 'empty';
	}
}
