/**
 * ----------- EasyComputerPlayer ----------
 */

import { ComputerPlayer } from './computer-player.js';
import { getRandomInt } from '../utils.js';
import { Gameboard } from '../gameboard.js';

export class EasyComputerPlayer extends ComputerPlayer {
	constructor() {
		super();
		this.attackedCoordinates = new Set();
	}

	resetHistory() {
		this.attackedCoordinates = new Set();
	}

	getRandomCoordinate() {
		let row = null;
		let col = null;

		do {
			row = getRandomInt(0, 9);
			col = getRandomInt(0, 9);
		} while (this.attackedCoordinates.has(String([row, col])));

		return { row, col };
	}

	attack(enemyBoard) {
		if (!(enemyBoard instanceof Gameboard)) {
			throw new Error('Must attack an enemy Gameboard instance');
		}

		const { row, col } = this.getRandomCoordinate();
		this.attackedCoordinates.add(String([row, col]));

		return enemyBoard.receiveAttack(row, col);
	}
}
