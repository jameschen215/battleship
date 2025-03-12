import { Player } from './player.js';
import { Gameboard } from './gameboard.js';

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
