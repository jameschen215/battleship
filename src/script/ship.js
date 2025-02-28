import { MAX_SHIP_SIZE, MIN_SHIP_SIZE } from './constants.js';

export class Ship {
	#hits = 0;

	constructor(size) {
		if (
			!Number.isInteger(size) ||
			size < MIN_SHIP_SIZE ||
			size > MAX_SHIP_SIZE
		) {
			throw new Error(
				`Size must be an integer between ${MIN_SHIP_SIZE} and ${MAX_SHIP_SIZE}`
			);
		}

		this.size = size;
	}

	getHits() {
		return this.#hits;
	}

	hit() {
		this.#hits += 1;
	}

	isSunk() {
		return this.#hits >= this.size;
	}
}
