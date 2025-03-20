import { Player } from './player.js';
import { Gameboard } from './gameboard.js';

export class HumanPlayer extends Player {
	#name = 'Player';

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

		const result = enemyBoard.receiveAttack(row, col);

		return { row, col, result };
	}
}
