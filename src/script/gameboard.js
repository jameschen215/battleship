import { Ship } from './ship';

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
	static BOARD_SIZE = 10;
	static DIRECTIONS = ['horizontal', 'vertical'];

	#board = this.#createBoard();
	#ships = [];

	constructor(...args) {
		if (args.length > 0) {
			throw new Error('Gameboard constructor requires no parameters');
		}
	}

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

		for (let row = 0; row < Gameboard.BOARD_SIZE; row++) {
			board[row] = [];
			for (let col = 0; col < Gameboard.BOARD_SIZE; col++) {
				board[row][col] = new Cell();
			}
		}

		return board;
	}

	placeShip(...args) {
		if (args.length < 3 || args.length > 4) {
			throw new Error(
				'placeShip requires size, startRow, startCol, and an optional direction'
			);
		}

		const [size, startRow, startCol, direction = 'horizontal'] = args;

		if (
			!Number.isInteger(startRow) ||
			startRow < 0 ||
			startRow >= Gameboard.BOARD_SIZE
		) {
			throw new Error(
				`startRow must be an integer between 0 and ${Gameboard.BOARD_SIZE - 1}`
			);
		}
		if (
			!Number.isInteger(startCol) ||
			startCol < 0 ||
			startCol >= Gameboard.BOARD_SIZE
		) {
			throw new Error(
				`startCol must be an integer between 0 and ${Gameboard.BOARD_SIZE - 1}`
			);
		}
		if (!Gameboard.DIRECTIONS.includes(direction)) {
			throw new Error('direction must be "horizontal" or "vertical"');
		}

		const ship = new Ship(size);
		const positions = [];

		for (let i = 0; i < size; i++) {
			let row = startRow + (direction === 'vertical' ? i : 0);
			let col = startCol + (direction === 'horizontal' ? i : 0);

			if (row >= Gameboard.BOARD_SIZE || col >= Gameboard.BOARD_SIZE) {
				throw new Error('Ship placement exceeds board boundaries');
			}

			// TODO: There should be one cell wide gap in between ships
			if (
				this.#ships.some((shipObj) =>
					shipObj.positions.some(([r, c]) => r === row && c === col)
				)
			) {
				throw new Error('Ship placement overlaps with another ship');
			}

			positions.push([row, col]);
		}

		this.#ships.push({ ship, positions });
	}

	receiveAttack(...args) {
		if (args.length !== 2) {
			throw new Error('receiveAttack requires exactly two parameters');
		}

		const [row, col] = args;

		if (
			!Number.isInteger(row) ||
			!Number.isInteger(col) ||
			row < 0 ||
			row >= Gameboard.BOARD_SIZE ||
			col < 0 ||
			col >= Gameboard.BOARD_SIZE
		) {
			throw new Error(
				`Coordinates must be integers between 0 and ${Gameboard.BOARD_SIZE - 1}`
			);
		}

		const cell = this.#board[row][col];

		if (cell.isAttacked()) {
			throw new Error('Cannot attack already attacked cells');
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
		if (
			!Number.isInteger(row) ||
			row < 0 ||
			row >= Gameboard.BOARD_SIZE ||
			!Number.isInteger(col) ||
			col < 0 ||
			col >= Gameboard.BOARD_SIZE
		) {
			throw new Error(
				`Coordinates must be integers between 0 and ${Gameboard.BOARD_SIZE - 1}`
			);
		}
		return this.#board[row][col].state;
	}

	reset() {
		this.#board = this.#createBoard();
		this.#ships = [];
	}

	isCellAttacked(row, col) {
		if (
			!Number.isInteger(row) ||
			!Number.isInteger(col) ||
			row < 0 ||
			row >= Gameboard.BOARD_SIZE ||
			col < 0 ||
			col >= Gameboard.BOARD_SIZE
		) {
			throw new Error('Coordinates must be integers between 0 and 9');
		}

		return this.#board[row][col].state !== 'empty';
	}
}
