export class Ship {
	static MIN_SIZE = 2;
	static MAX_SIZE = 5;

	#hits = 0;

	constructor(size) {
		if (
			!Number.isInteger(size) ||
			size < Ship.MIN_SIZE ||
			size > Ship.MAX_SIZE
		) {
			throw new Error(
				`Size must be an integer between ${Ship.MIN_SIZE} and ${Ship.MAX_SIZE}`
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
