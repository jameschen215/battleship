import { createShip } from './ship';

const BOARD_SIZE = 10;

function createCell() {
	let state = 0;
	const setState = (value) => (state = value);
	const getState = () => state;
	return { getState, setState };
}

export function createGameBoard() {
	if (arguments.length !== 0) {
		throw new Error('The factory function does not require any parameters.');
	}

	const board = [];
	const ships = [];

	// Create a 2d array that will represent the state of the game board
	const setBoard = () => {
		for (let row = 0; row < BOARD_SIZE; row++) {
			board[row] = [];
			for (let col = 0; col < BOARD_SIZE; col++) {
				board[row].push(createCell());
			}
		}
	};

	const getBoard = () => board;

	const getShips = () => ships;

	const placeShip = (size, startRow, startCol, direction = 'horizontal') => {
		const ship = createShip(size);
		const positions = [];

		for (let i = 0; i < size; i++) {
			let row = startRow;
			let col = startCol;

			if (direction === 'horizontal') col += i;
			if (direction === 'vertical') row += i;

			// Check if the ship is placed out of the board
			if (row >= BOARD_SIZE || col >= BOARD_SIZE || row < 0 || col < 0) {
				throw new Error('Ship placement out of bounds.');
			}

			// Check if the ship overlap another one
			if (
				ships.some((s) => s.positions.some(([r, c]) => r === row && c === col))
			) {
				throw new Error('Ship overlaps another ship.');
			}

			positions.push([row, col]);
		}

		ships.push({ ship, positions });
	};

	const receiveAttack = (row, col) => {
		if (row >= BOARD_SIZE || col >= BOARD_SIZE) {
			throw new Error('Attack out of the board.');
		}

		if (board[row][col].getState() !== 0) {
			throw new Error('Cell already attacked');
		}

		for (const { ship, positions } of ships) {
			if (positions.some(([r, c]) => r === row && c === col)) {
				ship.hit();
				board[row][col].setState(1);
				return true;
			}
		}

		board[row][col].setState(2);
		return false;
	};

	const allSunk = () => ships.every(({ ship }) => ship.isSunk());

	return { setBoard, getBoard, getShips, placeShip, receiveAttack, allSunk };
}
