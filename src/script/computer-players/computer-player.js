import { Player } from '../player.js';

export class ComputerPlayer extends Player {
	#name;

	constructor(name = 'Bot') {
		super();
		this.#name = name;
	}

	get name() {
		return this.#name;
	}

	set name(newName) {
		this.#name = newName;
	}

	resetHistory() {
		throw new Error('resetHistory method must be implemented by subclass');
	}

	getRandomCoordinate() {
		throw new Error(
			'getRandomCoordinate method must be implemented by subclass'
		);
	}
}
