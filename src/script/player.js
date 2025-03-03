import { Gameboard } from './gameboard.js';
import { SHIP_SIZES, BOARD_SIZE } from './constants.js';

export class Player {
	/**
	 * Base class for players, initializes with a Gameboard.
	 */
	constructor() {
		this.gameboard = new Gameboard();
	}

	placeShips() {
		this.gameboard.ships = [];
		for (const size of SHIP_SIZES) {
			let placed = false;

			while (!placed) {
				const row = Math.floor(Math.random() * BOARD_SIZE);
				const col = Math.floor(Math.random() * BOARD_SIZE);
				const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
				placed = this.gameboard.placeShip(size, row, col, direction).success;
			}
		}
	}

	attack(enemyBoard, row, col) {
		throw new Error('attack method must be implemented by subclass');
	}
}

export class HumanPlayer extends Player {
	#name = 'Unnamed';

	get name() {
		return this.#name;
	}

	set name(newName) {
		this.#name = newName;
	}

	attack(enemyBoard, row, col) {
		if (!(enemyBoard instanceof Gameboard)) {
			throw new Error('Must attack an enemy Gameboard instance');
		}

		return enemyBoard.receiveAttack(row, col);
	}
}

export class ComputerPlayer extends Player {
	#name = 'Bot';

	get name() {
		return this.#name;
	}

	set name(newName) {
		this.#name = newName;
	}

	attack(enemyBoard) {
		if (!(enemyBoard instanceof Gameboard)) {
			throw new Error('Must attack an enemy Gameboard instance');
		}

		let row;
		let col;

		do {
			row = Math.floor(Math.random() * this.gameboard.board.length);
			col = Math.floor(Math.random() * this.gameboard.board.length);
		} while (enemyBoard.isCellAttacked(row, col));

		return enemyBoard.receiveAttack(row, col);
	}
}
