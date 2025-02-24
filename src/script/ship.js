const MAX_SIZE = 5;
const MIN_SIZE = 2;

export function createShip(size) {
	if (arguments.length !== 1) {
		throw new Error(
			'This function requires only one parameter - no more, no fewer.'
		);
	}

	if (!Number.isInteger(size) || size > MAX_SIZE || size < MIN_SIZE) {
		throw new Error(
			'Size should be an integer and between 2 and 5, inclusive.'
		);
	}

	return {
		size,
		hits: 0,
		hit() {
			this.hits += 1;
		},
		isSunk() {
			return this.hits >= this.size;
		},
	};
}
