import { Gameboard } from './gameboard.js';

export class Player {
	/**
	 * Base class for players, initializes with a Gameboard.
	 */
	constructor() {
		this.gameboard = new Gameboard();
	}

	placeShips(shipSizes) {
		for (const size of shipSizes) {
			let placed = false;

			while (!placed) {
				const row = Math.floor(Math.random() * Gameboard.BOARD_SIZE);
				const col = Math.floor(Math.random() * Gameboard.BOARD_SIZE);
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
	constructor(name = 'Unnamed') {
		super();
		this.name = name;
	}

	attack(enemyBoard, row, col) {
		if (!(enemyBoard instanceof Gameboard)) {
			throw new Error('Must attack an enemy Gameboard instance');
		}

		return enemyBoard.receiveAttack(row, col);
	}
}

export class ComputerPlayer extends Player {
	constructor() {
		super();
		this.name = 'Bot';
	}

	attack(enemyBoard) {
		if (!(enemyBoard instanceof Gameboard)) {
			throw new Error('Must attack an enemy Gameboard instance');
		}

		let row;
		let col;

		do {
			row = Math.floor(Math.random() * Gameboard.BOARD_SIZE);
			col = Math.floor(Math.random() * Gameboard.BOARD_SIZE);
		} while (enemyBoard.isCellAttacked(row, col));

		return enemyBoard.receiveAttack(row, col);
	}
}
