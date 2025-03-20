import { BOARD_SIZE, SHIP_DIRECTIONS } from './constants.js';
import { isCoordinateOnBoard, getBufferZone } from './helpers.js';

import { Ship } from './ship';

export class Cell {
	static STATES = ['empty', 'hit', 'miss', 'gap'];

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
		return this.#state === 'hit' || this.#state === 'miss';
	}
}

export class Gameboard {
	#ships = [];
	#board = [];

	constructor() {
		this.setBoard();
	}

	// Set state of cells that is some ships' buffer zone as 'gap'
	#setBufferZone(ship, positions) {
		getBufferZone(positions, ship.size, ship.direction).forEach(
			([row, col]) => {
				const cell = this.#board[row][col];
				cell.state = cell.state === 'empty' ? 'gap' : cell.state;
			}
		);
	}

	setBoard() {
		for (let row = 0; row < BOARD_SIZE; row++) {
			this.#board[row] = [];
			for (let col = 0; col < BOARD_SIZE; col++) {
				this.#board[row][col] = new Cell();
			}
		}
	}

	get board() {
		// Return a shallow copy to prevent direct mutation
		return this.#board.map((row) => [...row]);
	}

	set ships(newValue) {
		this.#ships = newValue;
	}

	get ships() {
		// Return a shallow copy to prevent direct mutation
		return [...this.#ships];
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
		if (!SHIP_DIRECTIONS.includes(direction)) {
			return {
				success: false,
				reason: 'Directions must be "horizontal" or "vertical"',
			};
		}

		const ship = new Ship(size, direction);
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

			// Check if ships overlapping each other's positions or buffer zone
			if (
				this.ships.some(({ ship, positions }) =>
					[
						...positions,
						...getBufferZone(positions, ship.size, ship.direction),
					].some(([br, bc]) => br === row && bc === col)
				)
			) {
				return {
					success: false,
					reason: "Ship placement overlaps with another ship's buffer zone",
				};
			}

			positions.push([row, col]);
		}

		this.#ships.push({ ship, positions });

		return { success: true, reason: null };
	}

	receiveAttack(row, col) {
		if (!isCoordinateOnBoard(row, col)) {
			return { hit: false, sunk: false, reason: 'invalid coordinate' };
		}

		const cell = this.#board[row][col];

		if (cell.isAttacked()) {
			return { hit: false, sunk: false, reason: 'Cell has been attacked.' };
		}

		for (const { ship, positions } of this.#ships) {
			// If hitting a ship
			if (positions.some(([r, c]) => r === row && c === col)) {
				ship.hit();
				cell.state = 'hit';

				if (ship.isSunk()) {
					this.#setBufferZone(ship, positions);
				}

				return { hit: true, sunk: ship.isSunk() };
			}
		}
		// If missing ships
		cell.state = 'miss';
		return { hit: false, sunk: false };
	}

	allSunk() {
		// If there's no ship on board before initialization of the game
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

		const state = this.#board[row][col].state;

		return state === 'hit' || state === 'miss';
	}
}
