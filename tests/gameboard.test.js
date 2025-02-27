import { Gameboard, Cell } from '../src/script/gameboard.js';
import { Ship } from '../src/script/ship.js';

describe('Gameboard', () => {
	describe('existence', () => {
		it('is a defined class', () => {
			expect(Gameboard).toBeDefined();
			expect(typeof Gameboard).toBe('function');
		});
	});

	describe('Gameboard static properties', () => {
		it('defines BOARD_SIZE and DIRECTIONS', () => {
			expect(Gameboard.BOARD_SIZE).toBe(10);
			expect(Gameboard.DIRECTIONS).toEqual(['horizontal', 'vertical']);
		});
	});

	describe('constructor', () => {
		it('requires no parameter', () => {
			expect(() => new Gameboard(1)).toThrow(
				'Gameboard constructor requires no parameters'
			);
			expect(() => new Gameboard(1, 2)).toThrow(
				'Gameboard constructor requires no parameters'
			);
		});

		it('creates a gameboard with correct setup', () => {
			const gameboard = new Gameboard();

			expect(typeof gameboard.placeShip).toBe('function');
			expect(typeof gameboard.receiveAttack).toBe('function');
			expect(typeof gameboard.allSunk).toBe('function');
			expect(typeof gameboard.getCellState).toBe('function');
			expect(typeof gameboard.reset).toBe('function');
			expect(typeof gameboard.isCellAttacked).toBe('function');

			gameboard.board.forEach((row) => {
				row.forEach((cell) => {
					expect(cell.state).toBe('empty');
				});
			});
		});
	});

	describe('has board getter and ships getter', () => {
		let gameboard;

		beforeEach(() => {
			gameboard = new Gameboard();
		});

		it('has a board getter that returns a 10x10 grid of Cell instances', () => {
			const board = gameboard.board;

			expect(board.length).toBe(10);
			board.forEach((row) => {
				expect(row.length).toBe(10);
				row.forEach((cell) => {
					expect(cell instanceof Cell).toBe(true);
					expect(cell.state).toBe('empty');
				});
			});
		});

		it('has a ships getter', () => {
			const expectedShips = [
				{
					ship: new Ship(3),
					positions: [
						[0, 0],
						[0, 1],
						[0, 2],
					],
				},
			];

			gameboard.placeShip(3, 0, 0);
			expect(gameboard.ships).toEqual(expectedShips);
		});

		it('returns a copy of the ships array', () => {
			gameboard.placeShip(3, 0, 0);
			const shipsCopy = gameboard.ships;
			shipsCopy.push({}); // Modify the returned array
			expect(gameboard.ships.length).toBe(1); // Original should remain unchanged
		});
	});

	describe('placeShip', () => {
		let gameboard;

		beforeEach(() => {
			gameboard = new Gameboard();
		});

		// it('requires size, startRow, startCol, and an optional direction', () => {
		// 	expect(() => gameboard.placeShip()).toThrow(
		// 		'placeShip requires size, startRow, startCol, and an optional direction'
		// 	);
		// 	expect(() => gameboard.placeShip(3)).toThrow(
		// 		'placeShip requires size, startRow, startCol, and an optional direction'
		// 	);
		// 	expect(() => gameboard.placeShip(3, 0)).toThrow(
		// 		'placeShip requires size, startRow, startCol, and an optional direction'
		// 	);
		// 	expect(() => gameboard.placeShip(3, 0, 0, 'horizontal', true)).toThrow(
		// 		'placeShip requires size, startRow, startCol, and an optional direction'
		// 	);
		// });

		it('returns unsuccess for invalid start points', () => {
			expect(gameboard.placeShip(3, '1', 0)).toEqual({
				success: false,
				reason: 'Coordinates are not invalid or out of board boundaries',
			});
			expect(gameboard.placeShip(3, 3.5, 2)).toEqual({
				success: false,
				reason: 'Coordinates are not invalid or out of board boundaries',
			});
			expect(gameboard.placeShip(3, 0, 10)).toEqual({
				success: false,
				reason: 'Coordinates are not invalid or out of board boundaries',
			});
		});

		it('returns unsuccess for invalid directions', () => {
			expect(gameboard.placeShip(3, 0, 0, 'diagonal')).toEqual({
				success: false,
				reason: 'Directions must be "horizontal" or "vertical"',
			});
			expect(gameboard.placeShip(3, 0, 0, '')).toEqual({
				success: false,
				reason: 'Directions must be "horizontal" or "vertical"',
			});
		});

		it('places a ship horizontally by default', () => {
			gameboard.placeShip(2, 7, 7);
			expect(gameboard.ships[0].positions).toEqual([
				[7, 7],
				[7, 8],
			]);
		});

		it('places a ship vertically when specified', () => {
			gameboard.placeShip(3, 0, 0, 'vertical');

			expect(gameboard.ships[0].positions).toEqual([
				[0, 0],
				[1, 0],
				[2, 0],
			]);
		});

		it('returns success when a ship is placed', () => {
			const result = gameboard.placeShip(3, 0, 0);
			expect(result.success).toBe(true);
		});

		it('returns unsuccess when fail to placed a ship', () => {
			gameboard.placeShip(3, 0, 0);
			const result = gameboard.placeShip(2, 0, 0);
			expect(result.success).toBe(false);
		});

		it('returns unsuccess when ships out of bounds', () => {
			expect(gameboard.placeShip(4, 8, 8)).toEqual({
				success: false,
				reason: 'Ship placement exceeds board boundaries',
			});
			expect(gameboard.placeShip(2, 9, 0, 'vertical')).toEqual({
				success: false,
				reason: 'Ship placement exceeds board boundaries',
			});
		});

		it('returns unsuccess when ships overlapping each other', () => {
			gameboard.placeShip(3, 1, 1);
			expect(gameboard.placeShip(4, 0, 1, 'vertical')).toEqual({
				success: false,
				reason: 'Ship placement overlaps with another ship',
			});
		});
	});

	describe('receiveAttack', () => {
		let gameboard;

		beforeEach(() => {
			gameboard = new Gameboard();
		});

		it('requires exactly two parameters', () => {
			expect(() => gameboard.receiveAttack()).toThrow(
				'receiveAttack requires exactly two parameters'
			);
			expect(() => gameboard.receiveAttack(1)).toThrow(
				'receiveAttack requires exactly two parameters'
			);
			expect(() => gameboard.receiveAttack(1, 2, 3)).toThrow(
				'receiveAttack requires exactly two parameters'
			);
		});

		it('throws errors for invalid coordinates ', () => {
			expect(() => gameboard.receiveAttack(-1, -1)).toThrow(
				'Coordinates must be integers between 0 and 9'
			);
			expect(() => gameboard.receiveAttack(10, 10)).toThrow(
				'Coordinates must be integers between 0 and 9'
			);
			expect(() => gameboard.receiveAttack('0', '0')).toThrow(
				'Coordinates must be integers between 0 and 9'
			);
		});

		it('marks a cell as hit when attacking a ship', () => {
			gameboard.placeShip(3, 0, 0, 'horizontal');
			gameboard.receiveAttack(0, 0);

			expect(gameboard.ships[0].ship.getHits()).toBe(1);

			gameboard.board.forEach((row, i) => {
				row.forEach((cell, j) => {
					if (i === 0 && j === 0) {
						expect(cell.state).toBe('hit');
					} else {
						expect(cell.state).toBe('empty');
					}
				});
			});
		});

		it('marks a cell as miss when no ship is present', () => {
			gameboard.placeShip(3, 0, 0, 'horizontal');
			gameboard.receiveAttack(7, 7);

			expect(gameboard.ships[0].ship.getHits()).toBe(0);

			gameboard.board.forEach((row, i) => {
				row.forEach((cell, j) => {
					if (i === 7 && j === 7) {
						expect(cell.state).toBe('miss');
					} else {
						expect(cell.state).toBe('empty');
					}
				});
			});
		});

		it('returns sunk status when a ship is fully hit', () => {
			gameboard.placeShip(2, 0, 0);
			gameboard.receiveAttack(0, 0);
			expect(gameboard.receiveAttack(0, 1)).toEqual({ hit: true, sunk: true });
		});

		it('returns miss status when no ship is hit', () => {
			expect(gameboard.receiveAttack(0, 0)).toEqual({
				hit: false,
				sunk: false,
			});
		});

		it('throws error when receive attack on attacked cell', () => {
			gameboard.placeShip(3, 0, 0, 'horizontal');
			gameboard.receiveAttack(0, 0);
			gameboard.receiveAttack(9, 9);

			expect(() => gameboard.receiveAttack(0, 0)).toThrow(
				'Cannot attack already attacked cells'
			);
			expect(() => gameboard.receiveAttack(9, 9)).toThrow(
				'Cannot attack already attacked cells'
			);
		});
	});

	describe('allSunk', () => {
		let gameboard;

		beforeEach(() => {
			gameboard = new Gameboard();
		});

		it('returns false when no ship on board', () => {
			expect(gameboard.allSunk()).toBe(false);
		});

		it('returns true when all ships are sunk', () => {
			gameboard.placeShip(2, 0, 0);
			gameboard.placeShip(1, 3, 3);
			gameboard.placeShip(2, 7, 2);

			gameboard.receiveAttack(0, 0);
			gameboard.receiveAttack(0, 1);
			gameboard.receiveAttack(3, 3);
			gameboard.receiveAttack(7, 2);
			gameboard.receiveAttack(7, 3);

			expect(gameboard.allSunk()).toBe(true);
		});

		it('returns false when the ships are placed', () => {
			gameboard.placeShip(2, 0, 0);
			gameboard.placeShip(1, 3, 3);
			gameboard.placeShip(2, 7, 2);

			expect(gameboard.allSunk()).toBe(false);
		});

		it('returns false when not all ships are sunk', () => {
			gameboard.placeShip(2, 0, 0);
			gameboard.placeShip(1, 3, 3);
			gameboard.placeShip(2, 7, 2);

			gameboard.receiveAttack(0, 0);
			gameboard.receiveAttack(0, 1);

			expect(gameboard.allSunk()).toBe(false);
		});

		it('returns false when some ships are sunk but not all', () => {
			gameboard.placeShip(2, 0, 0);
			gameboard.placeShip(2, 2, 2);
			gameboard.receiveAttack(0, 0);
			gameboard.receiveAttack(0, 1); // Sink first ship
			expect(gameboard.allSunk()).toBe(false); // Second ship remains
		});

		it('sinks a ship after sufficient hits', () => {
			gameboard.placeShip(2, 0, 0);
			gameboard.receiveAttack(0, 0);
			gameboard.receiveAttack(0, 1);
			expect(gameboard.ships[0].ship.isSunk()).toBe(true);
		});
	});

	describe('getCellState', () => {
		let gameboard;

		beforeEach(() => {
			gameboard = new Gameboard();
		});

		it('throws error for invalid coordinates', () => {
			expect(() => gameboard.getCellState()).toThrow(
				'Coordinates must be integers between 0 and 9'
			);
			expect(() => gameboard.getCellState(0)).toThrow(
				'Coordinates must be integers between 0 and 9'
			);
			expect(() => gameboard.getCellState(0, -1)).toThrow(
				'Coordinates must be integers between 0 and 9'
			);
			expect(() => gameboard.getCellState(10, 1)).toThrow(
				'Coordinates must be integers between 0 and 9'
			);
		});

		it('returns "empty" for an unattacked ship cell', () => {
			gameboard.placeShip(3, 0, 0);
			expect(gameboard.getCellState(0, 1)).toBe('empty');
		});

		it('returns "hit" for an attacked ship cell', () => {
			gameboard.placeShip(3, 0, 0);
			gameboard.receiveAttack(0, 0);
			expect(gameboard.getCellState(0, 0)).toBe('hit');
		});

		it('returns "miss" for a no-ship cell', () => {
			gameboard.placeShip(3, 0, 0);
			gameboard.receiveAttack(0, 4);
			expect(gameboard.getCellState(0, 4)).toBe('miss');
		});

		it('does not modify the board when called', () => {
			gameboard.placeShip(3, 0, 0);
			gameboard.receiveAttack(0, 0);
			const initialBoard = gameboard.board.map((row) =>
				row.map((cell) => cell.state)
			);
			gameboard.getCellState(0, 0);
			expect(
				gameboard.board.map((row) => row.map((cell) => cell.state))
			).toEqual(initialBoard);
		});
	});

	describe('isCellAttacked', () => {
		let gameboard;

		beforeEach(() => {
			gameboard = new Gameboard();
		});

		it('throws error for invalid coordinates', () => {
			expect(() => gameboard.isCellAttacked()).toThrow(
				'Coordinates must be integers between 0 and 9'
			);
			expect(() => gameboard.isCellAttacked(0)).toThrow(
				'Coordinates must be integers between 0 and 9'
			);
			expect(() => gameboard.isCellAttacked(0, -1)).toThrow(
				'Coordinates must be integers between 0 and 9'
			);
			expect(() => gameboard.isCellAttacked(10, 1)).toThrow(
				'Coordinates must be integers between 0 and 9'
			);
		});

		it('returns true when a cell is attacked', () => {
			gameboard.receiveAttack(0, 0);
			expect(gameboard.isCellAttacked(0, 0)).toBe(true);
		});

		it('returns true when a cell is attacked', () => {
			gameboard.receiveAttack(0, 0);
			expect(gameboard.isCellAttacked(1, 1)).toBe(false);
		});
	});

	describe('reset', () => {
		it('resets the board and ships to their initial state', () => {
			const gameboard = new Gameboard();
			gameboard.placeShip(2, 0, 0);
			gameboard.receiveAttack(0, 0);
			gameboard.reset();
			expect(gameboard.board).toEqual(
				Array(10)
					.fill()
					.map(() =>
						Array(10)
							.fill()
							.map(() => expect.objectContaining({ state: 'empty' }))
					)
			);
			expect(gameboard.ships).toEqual([]);
		});
	});
});
