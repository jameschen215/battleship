import { MAX_SHIP_SIZE, MIN_SHIP_SIZE, SHIP_DIRECTIONS } from './constants.js';

export class Ship {
	#hits = 0;
	#size = null;
	#direction = '';

	constructor(size, direction) {
		if (
			!Number.isInteger(size) ||
			size < MIN_SHIP_SIZE ||
			size > MAX_SHIP_SIZE
		) {
			throw new Error(
				`Size must be an integer between ${MIN_SHIP_SIZE} and ${MAX_SHIP_SIZE}`
			);
		}

		if (!SHIP_DIRECTIONS.includes(direction)) {
			throw new Error('Directions must be "horizontal" or "vertical"');
		}

		this.#size = size;
		this.#direction = direction;
	}

	get size() {
		return this.#size;
	}

	get direction() {
		return this.#direction;
	}

	get hits() {
		return this.#hits;
	}

	hit() {
		this.#hits += 1;
	}

	isSunk() {
		return this.#hits >= this.size;
	}
}
