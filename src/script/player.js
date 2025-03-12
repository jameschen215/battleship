import { SHIP_SIZES, BOARD_SIZE } from './constants.js';

import { Gameboard } from './gameboard.js';

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
