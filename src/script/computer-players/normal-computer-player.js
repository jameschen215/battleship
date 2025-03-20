import { getRandomInt, shuffle } from '../utils.js';
import { isCoordinateOnBoard } from '../helpers.js';

import { Gameboard } from '../gameboard.js';
import { ComputerPlayer } from './computer-player.js';

export class NormalComputerPlayer extends ComputerPlayer {
	#hitQueue = null;
	#attackedCoordinates = null;
	#attackingShipDirection = null;
	#rightwardOrDownward = null;
	#goBack = null;

	constructor() {
		super();

		// Queue for hits for explore
		this.#hitQueue = [];

		// Track attacked cells
		this.#attackedCoordinates = new Set();

		// Save attacked ship's direction
		this.#attackingShipDirection = '';
		this.#rightwardOrDownward = true;
		this.#goBack = false;
	}

	// hitQueue getter
	get hitQueue() {
		return [...this.#hitQueue];
	}

	// attackedCoordinates getter
	get attackedCoordinates() {
		return new Set(this.#attackedCoordinates);
	}

	// getter and setter of attackingShipDirection
	get attackingShipDirection() {
		return this.#attackingShipDirection;
	}

	set attackingShipDirection(newDirection) {
		this.#attackingShipDirection = newDirection;
	}

	// getter and setter of rightwardOrDownward
	get rightwardOrDownward() {
		return this.#rightwardOrDownward;
	}

	set rightwardOrDownward(newValue) {
		this.#rightwardOrDownward = newValue;
	}

	// getter and setter of rightwardOrDownward
	get goBack() {
		return this.#goBack;
	}

	set goBack(newValue) {
		this.#goBack = newValue;
	}

	resetHistory() {
		this.#hitQueue = [];
		this.#attackedCoordinates = new Set();

		this.#attackingShipDirection = '';
		this.#rightwardOrDownward = true;
		this.#goBack = false;
	}

	#getRandomCoordinate() {
		let row = null;
		let col = null;

		do {
			row = getRandomInt(0, 9);
			col = getRandomInt(0, 9);
		} while (this.#attackedCoordinates.has(JSON.stringify([row, col])));

		return { row, col };
	}

	attack(enemyBoard) {
		if (!(enemyBoard instanceof Gameboard)) {
			throw new Error('Must attack an enemy Gameboard instance');
		}

		let row = null;
		let col = null;

		if (this.#hitQueue.length > 0) {
			let lastHit = this.#hitQueue.at(-1);

			if (this.#goBack) {
				lastHit = this.#hitQueue[0];
				this.#goBack = !this.#goBack;
			}

			if (this.#attackingShipDirection === 'horizontal') {
				row = lastHit.row;
				col = this.#rightwardOrDownward ? lastHit.col + 1 : lastHit.col - 1;
			} else if (this.#attackingShipDirection === 'vertical') {
				row = this.#rightwardOrDownward ? lastHit.row + 1 : lastHit.row - 1;
				col = lastHit.col;
			} else {
				const adjacentCells = [
					{ row: lastHit.row + 1, col: lastHit.col }, // Up
					{ row: lastHit.row - 1, col: lastHit.col }, // Down
					{ row: lastHit.row, col: lastHit.col - 1 }, // Left
					{ row: lastHit.row, col: lastHit.col + 1 }, // Right
				];

				// Looking for a valid, un-attacked adjacent cell
				for (const coordinate of shuffle(adjacentCells)) {
					const key = JSON.stringify([coordinate.row, coordinate.col]);

					if (
						isCoordinateOnBoard(coordinate.row, coordinate.col) &&
						!this.#attackedCoordinates.has(key)
					) {
						// If the coordinate on board and un-attacked, get it
						({ row, col } = coordinate);
						break;
					}
				}

				// If no valid adjacent cell, remove the hit one and try a random one
				if (row === null) {
					this.#hitQueue.shift();
					({ row, col } = this.#getRandomCoordinate());
				}
			}
		} else {
			// If there are no hit cells, select a random one.
			({ row, col } = this.#getRandomCoordinate());
		}

		// Launch an attack at the specified coordinate and monitor the result.
		const result = enemyBoard.receiveAttack(row, col);

		// Mark the coordinate as attacked
		this.#attackedCoordinates.add(JSON.stringify([row, col]));

		if (result.hit && !result.sunk) {
			// Get the last hit cell
			let lastHit = null;
			if (this.#hitQueue.length > 0) {
				lastHit = this.#hitQueue.at(-1);
			}

			// determine the hit ship's direction and rightward or downward
			// by comparing the coord of the current hit cell and the last hit cell
			if (lastHit && row === lastHit.row) {
				this.#attackingShipDirection = 'horizontal';
				this.#rightwardOrDownward = col - lastHit.col > 0;
			} else if (lastHit && col === lastHit.col) {
				this.#attackingShipDirection = 'vertical';
				this.#rightwardOrDownward = row - lastHit.row > 0;
			}

			// Since hit, add the current hit coordinate to hitQueue
			this.#hitQueue.push({ row, col });
		} else if (result.sunk) {
			// If ship sunk, clear related hits from queue
			this.#hitQueue = this.#hitQueue.filter(
				(hit) => hit.row !== row && hit.col !== col
			);

			// Reset the direction
			this.#attackingShipDirection = '';
			this.#rightwardOrDownward = true;
		} else if (!result.hit && this.#attackingShipDirection !== '') {
			/**
			 * If you go beyond the first or the last component, return to
			 * the first hit component and move in the opposite direction.
			 */
			this.#goBack = true;
			this.#rightwardOrDownward = !this.#rightwardOrDownward;
		}

		return { row, col, result };
	}
}
