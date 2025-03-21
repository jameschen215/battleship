/**
 * ----------- HardComputerPlayer ----------
 */

import { BOARD_SIZE, SHIP_SIZES } from '../constants.js';
import { getRandomInt, shuffle } from '../utils.js';
import {
	isCoordinateOnBoard,
	getSunkShipsBufferZone,
	groupedSurroundingCoordinates,
	getSurroundings,
} from '../helpers.js';

import { Gameboard } from '../gameboard.js';
import { ComputerPlayer } from './computer-player.js';

export class HardComputerPlayer extends ComputerPlayer {
	#remainingShipSizes = null;
	#sunkShips = null;
	#attackedCoordinates = null;
	#hitQueue = null;
	#attackingShipDirection = '';
	#rightwardOrDownward = null;
	#goBack = null;

	constructor() {
		super();

		// Track remaining ship's size
		this.#remainingShipSizes = SHIP_SIZES.slice();

		// Track sunk ships
		this.#sunkShips = [];

		// Track attacked cells
		this.#attackedCoordinates = new Set();

		// Queue for hits for explore
		this.#hitQueue = [];

		// Save attacked ship's direction
		this.#attackingShipDirection = '';
		this.#rightwardOrDownward = true;
		this.#goBack = false;
	}

	// getters
	get remainingShipSizes() {
		return [...this.#remainingShipSizes];
	}

	set remainingShipSizes(newValue) {
		this.#remainingShipSizes = newValue;
	}

	get sunkShips() {
		return [...this.#sunkShips];
	}

	set sunkShips(newValue) {
		this.#sunkShips = newValue;
	}

	get attackedCoordinates() {
		return new Set(this.#attackedCoordinates);
	}

	set attackedCoordinates(newValue) {
		this.#attackedCoordinates = newValue;
	}

	get hitQueue() {
		return [...this.#hitQueue];
	}

	set hitQueue(newValue) {
		this.#hitQueue = newValue;
	}

	get attackingShipDirection() {
		return this.#attackingShipDirection;
	}

	set attackingShipDirection(newValue) {
		this.#attackingShipDirection = newValue;
	}

	get rightwardOrDownward() {
		return this.#rightwardOrDownward;
	}

	set rightwardOrDownward(newValue) {
		this.#rightwardOrDownward = newValue;
	}

	get goBack() {
		return this.#goBack;
	}

	set goBack(newValue) {
		this.#goBack = newValue;
	}

	resetHistory() {
		this.#remainingShipSizes = SHIP_SIZES.slice();
		this.#sunkShips = [];
		this.#attackedCoordinates = new Set();
		this.#hitQueue = [];

		this.#attackingShipDirection = '';
		this.#rightwardOrDownward = true;
		this.#goBack = false;
	}

	// Get the smallest size of the remaining ships
	#getMaxSizeOfShip() {
		return Math.max(...this.#remainingShipSizes);
	}

	#isLongEnoughForShips(row, col, size) {
		return groupedSurroundingCoordinates(row, col, size).some((group) =>
			group.every(
				(coord) => !this.#attackedCoordinates.has(JSON.stringify(coord))
			)
		);
	}

	#isValidCoord(row, col) {
		const sunkShipBufferZone = getSunkShipsBufferZone(this.#sunkShips);

		return (
			isCoordinateOnBoard(row, col) &&
			!this.#attackedCoordinates.has(JSON.stringify([row, col])) &&
			!sunkShipBufferZone.has(JSON.stringify([row, col]))
		);
	}

	#getShipDirection(row, col) {
		let direction = '';
		let positive = true;

		// If the attack hit a ship and the ship isn't sunk,
		// try to get the last hit cell
		let lastHit = null;
		if (this.#hitQueue.length > 1) {
			lastHit = this.#hitQueue.at(-2);
		}

		// If there exists last hit cell,determine the hit ship's direction
		// and rightward or downward according to it, otherwise, carry on.
		// (the first hit cell has no last hit cell, so you cannot determine
		// the ship's direction)
		if (lastHit && row === lastHit.row) {
			direction = 'horizontal';
			positive = col - lastHit.col > 0;
		} else if (lastHit && col === lastHit.col) {
			direction = 'vertical';
			positive = row - lastHit.row > 0;
		}

		return { direction, positive };
	}

	#getRandomCoordinate() {
		let row = null;
		let col = null;

		do {
			row = getRandomInt(0, 9);
			col = getRandomInt(0, 9);
		} while (
			!this.#isValidCoord(row, col) ||
			!this.#isLongEnoughForShips(row, col, this.#getMaxSizeOfShip())
		);

		return { row, col };
	}

	attack(enemyBoard) {
		if (!(enemyBoard instanceof Gameboard)) {
			throw new Error('Must attack an enemy Gameboard instance');
		}

		let row = null;
		let col = null;

		// If there are at least one or more cells that are hit before
		if (this.#hitQueue.length > 0) {
			// get the last hit one
			let lastHit = this.#hitQueue.at(-1);

			// If go along the direction and find an invalid cell and the ship
			// isn't sunk, go back to the first hit cell and go the opposite direction
			if (this.#goBack) {
				lastHit = this.#hitQueue[0];
				this.#goBack = !this.#goBack;
			}

			// If attack inline horizontally, choose the adjacent cell horizontally
			if (this.#attackingShipDirection === 'horizontal') {
				// choose the left one if the direction is right to left,
				// otherwise choose the right one
				row = lastHit.row;
				col = this.#rightwardOrDownward ? lastHit.col + 1 : lastHit.col - 1;

				// If the next cell is invalid, like attacked or on gap
				if (!this.#isValidCoord(row, col)) {
					// Go back to the first hit cell and choose the adjacent cell on
					// the opposite side horizontally
					lastHit = this.#hitQueue[0];
					this.#rightwardOrDownward = !this.#rightwardOrDownward;
					col = this.#rightwardOrDownward ? lastHit.col + 1 : lastHit.col - 1;
				}
			} else if (this.#attackingShipDirection === 'vertical') {
				// If attack inline vertically, choose the adjacent cell vertically
				// choose the downside one if the direction is up to down,
				// otherwise choose the upside one
				row = this.#rightwardOrDownward ? lastHit.row + 1 : lastHit.row - 1;
				col = lastHit.col;

				if (!this.#isValidCoord(row, col)) {
					// Go back to the first hit cell and choose the adjacent cell on
					// the opposite side vertically
					lastHit = this.#hitQueue[0];
					this.#rightwardOrDownward = !this.#rightwardOrDownward;
					row = this.#rightwardOrDownward ? lastHit.row + 1 : lastHit.row - 1;
				}
			} else {
				// If there are no cells inline, get a random neighbor of the last hit cell
				const adjacentCells = [
					{ row: lastHit.row + 1, col: lastHit.col }, // Up
					{ row: lastHit.row - 1, col: lastHit.col }, // Down
					{ row: lastHit.row, col: lastHit.col - 1 }, // Left
					{ row: lastHit.row, col: lastHit.col + 1 }, // Right
				];

				// Looking for a valid, un-attacked adjacent cell
				for (const coord of shuffle(adjacentCells)) {
					if (this.#isValidCoord(coord.row, coord.col)) {
						({ row, col } = coord);
						break;
					}
				}

				// If no valid adjacent cell, i.e. all neighbors are clicked or on buffer zone
				// or on gap, remove the last hit one and try to choose an new random coordinate
				if (row === null) {
					this.#hitQueue.shift();
					({ row, col } = this.#getRandomCoordinate());
				}
			}
		} else {
			// If there are no hit cells, select a random coordinate.
			({ row, col } = this.#getRandomCoordinate());
		}

		// Launch an attack at the specified coordinate and monitor the result.
		const result = enemyBoard.receiveAttack(row, col);

		// Mark the coordinate as attacked
		this.#attackedCoordinates.add(JSON.stringify([row, col]));

		if (result.hit && !result.sunk) {
			// Since hit, add the coordinate to hitQueue
			this.#hitQueue.push({ row, col });

			// Set ship direction
			const { direction, positive } = this.#getShipDirection(row, col);
			this.#attackingShipDirection = direction;
			this.#rightwardOrDownward = positive;
		} else if (result.sunk) {
			// If the ship is sunk, add the coordinate to the hit queue to calculate
			// the ship's size and positions.
			// If you don't do this line, the size should be shorter than the actual
			// size by 1.
			this.#hitQueue.push({ row, col });

			const size = this.#hitQueue.length;

			// Set ship direction
			const { direction, positive } = this.#getShipDirection(row, col);
			this.#attackingShipDirection = direction;
			this.#rightwardOrDownward = positive;

			// Put the ship into sunk ships
			this.#sunkShips.push({
				size,
				direction: this.#attackingShipDirection,
				positions: this.#hitQueue.map(({ row, col }) => [row, col]),
			});

			// remove sunk ship's size from remainingShipSizes
			const index = this.#remainingShipSizes.indexOf(size);
			if (index !== -1) {
				this.#remainingShipSizes.splice(index, 1);
			}

			// Clear hitQueue entirely when ship is sunk
			this.#hitQueue = [];
			this.#attackingShipDirection = '';
			this.#rightwardOrDownward = true;
			this.#goBack = false;
		} else if (!result.hit && this.#attackingShipDirection !== '') {
			/**
			 * If you go beyond the first or last component, return to
			 * the first hit component and move in the opposite direction.
			 */
			this.#goBack = true;
			this.#rightwardOrDownward = !this.#rightwardOrDownward;
		}

		return { row, col, result };
	}
}
