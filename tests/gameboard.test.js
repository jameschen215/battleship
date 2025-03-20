import { Gameboard, Cell } from '../src/script/gameboard.js';
import { Ship } from '../src/script/ship.js';
import { BOARD_SIZE } from '../src/script/constants.js';

jest.mock('../src/script/constants.js', () => ({
	BOARD_SIZE: 3,
	SHIP_SIZES: [2, 2],
	SHIP_DIRECTIONS: ['horizontal', 'vertical'],
}));

describe('Gameboard', () => {
	describe('constructor', () => {
		it('is a defined class', () => {
			expect(Gameboard).toBeDefined();
			expect(typeof Gameboard).toBe('function');
		});

		it('set the board', () => {
			const gameboard = new Gameboard();

			expect(gameboard.board.length).toBe(3);

			gameboard.board.forEach((row) => {
				expect(row.length).toBe(3);

				row.forEach((cell) => {
					expect(cell instanceof Cell).toBe(true);
					expect(cell.state).toBe('empty');
				});
			});
		});
	});

	describe('has getter and setter', () => {
		let gameboard;

		beforeEach(() => {
			gameboard = new Gameboard();
		});

		afterEach(() => jest.resetAllMocks());

		it('has a board getter that returns a 3x3 grid of Cell instances', () => {
			const board = gameboard.board;

			expect(board.length).toBe(3);

			board.forEach((row) => {
				expect(row.length).toBe(3);

				row.forEach((cell) => {
					expect(cell instanceof Cell).toBe(true);
					expect(cell.state).toBe('empty');
				});
			});
		});

		it('has a ships getter', () => {
			const expectedShips = [
				{
					ship: new Ship(2, 'horizontal'),
					positions: [
						[0, 0],
						[0, 1],
					],
				},
			];

			gameboard.placeShip(2, 0, 0);
			expect(gameboard.ships).toEqual(expectedShips);
		});

		it('has a ships setter', () => {
			gameboard.placeShip(2, 0, 0);
			gameboard.ships = [];
			expect(gameboard.ships).toEqual([]);
		});

		it('returns a copy of the ships array', () => {
			gameboard.placeShip(2, 0, 0);
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

		it('returns unsuccess for invalid start points', () => {
			expect(gameboard.placeShip(2, '1', 0)).toEqual({
				success: false,
				reason: 'Coordinates are not invalid or out of board boundaries',
			});

			expect(gameboard.placeShip(2, 3.5, 2)).toEqual({
				success: false,
				reason: 'Coordinates are not invalid or out of board boundaries',
			});

			expect(gameboard.placeShip(2, 0, 10)).toEqual({
				success: false,
				reason: 'Coordinates are not invalid or out of board boundaries',
			});
		});

		it('returns unsuccess for invalid directions', () => {
			expect(gameboard.placeShip(2, 0, 0, 'diagonal')).toEqual({
				success: false,
				reason: 'Directions must be "horizontal" or "vertical"',
			});

			expect(gameboard.placeShip(2, 0, 0, '')).toEqual({
				success: false,
				reason: 'Directions must be "horizontal" or "vertical"',
			});
		});

		it('places a ship horizontally by default', () => {
			gameboard.placeShip(2, 0, 0);
			expect(gameboard.ships[0].positions).toEqual([
				[0, 0],
				[0, 1],
			]);
		});

		it('places a ship vertically when specified', () => {
			gameboard.placeShip(2, 0, 0, 'vertical');

			expect(gameboard.ships[0].positions).toEqual([
				[0, 0],
				[1, 0],
			]);
		});

		it('returns success when a ship is placed', () => {
			const result = gameboard.placeShip(3, 0, 0);
			expect(result.success).toBe(true);
		});

		it('returns unsuccess when fail to placed a ship', () => {
			gameboard.placeShip(2, 0, 0);
			const result = gameboard.placeShip(2, 0, 0);
			expect(result.success).toBe(false);
		});

		it('returns unsuccess when ships out of bounds', () => {
			expect(gameboard.placeShip(2, 4, 4)).toEqual({
				success: false,
				reason: 'Coordinates are not invalid or out of board boundaries',
			});

			expect(gameboard.placeShip(2, 4, 0, 'vertical')).toEqual({
				success: false,
				reason: 'Coordinates are not invalid or out of board boundaries',
			});
		});

		it('returns unsuccess when ships overlapping each other', () => {
			gameboard.placeShip(2, 0, 0);

			expect(gameboard.placeShip(2, 0, 1, 'vertical')).toEqual({
				success: false,
				reason: "Ship placement overlaps with another ship's buffer zone",
			});

			expect(gameboard.placeShip(2, 1, 1, 'vertical')).toEqual({
				success: false,
				reason: "Ship placement overlaps with another ship's buffer zone",
			});
		});
	});

	describe('receiveAttack', () => {
		let gameboard;

		beforeEach(() => {
			gameboard = new Gameboard();
		});

		it('return false info for invalid coordinate ', () => {
			expect(gameboard.receiveAttack(-1, -1)).toEqual({
				hit: false,
				sunk: false,
				reason: 'invalid coordinate',
			});

			expect(gameboard.receiveAttack(10, 10)).toEqual({
				hit: false,
				sunk: false,
				reason: 'invalid coordinate',
			});

			expect(gameboard.receiveAttack('0', '0')).toEqual({
				hit: false,
				sunk: false,
				reason: 'invalid coordinate',
			});
		});

		it('marks a cell as hit when attacking a ship', () => {
			gameboard.placeShip(2, 0, 0, 'horizontal');
			gameboard.receiveAttack(0, 0);

			expect(gameboard.ships[0].ship.hits).toBe(1);

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
			gameboard.receiveAttack(0, 0);

			expect(gameboard.ships.length).toBe(0);

			gameboard.board.forEach((row, i) => {
				row.forEach((cell, j) => {
					if (i === 0 && j === 0) {
						expect(cell.state).toBe('miss');
					} else {
						expect(cell.state).toBe('empty');
					}
				});
			});
		});

		it('returns hit info when a ship is fully hit', () => {
			gameboard.placeShip(2, 0, 0);
			gameboard.receiveAttack(0, 0);
			expect(gameboard.receiveAttack(0, 1)).toEqual({ hit: true, sunk: true });
		});

		it('returns miss info when no ship is hit', () => {
			expect(gameboard.receiveAttack(0, 0)).toEqual({
				hit: false,
				sunk: false,
			});
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

			gameboard.receiveAttack(0, 0);
			gameboard.receiveAttack(0, 1);

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
			gameboard.placeShip(2, 1, 0);

			gameboard.receiveAttack(0, 0);

			expect(gameboard.allSunk()).toBe(false);
		});

		it('returns false when some ships are sunk but not all', () => {
			gameboard.placeShip(2, 0, 0);
			gameboard.placeShip(2, 2, 1);
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
			gameboard = new Gameboard(10);
		});

		it('throws error for invalid coordinates', () => {
			expect(() => gameboard.getCellState()).toThrow(
				`Coordinates must be integers between 0 and ${BOARD_SIZE - 1}`
			);

			expect(() => gameboard.getCellState(0)).toThrow(
				`Coordinates must be integers between 0 and ${BOARD_SIZE - 1}`
			);

			expect(() => gameboard.getCellState(0, -1)).toThrow(
				`Coordinates must be integers between 0 and ${BOARD_SIZE - 1}`
			);

			expect(() => gameboard.getCellState(10, 1)).toThrow(
				`Coordinates must be integers between 0 and ${BOARD_SIZE - 1}`
			);
		});

		it('returns "empty" for an un-attacked ship cell', () => {
			gameboard.placeShip(3, 0, 0);
			expect(gameboard.getCellState(0, 1)).toBe('empty');
		});

		it('returns "hit" for an attacked ship cell', () => {
			gameboard.placeShip(3, 0, 0);
			gameboard.receiveAttack(0, 0);
			expect(gameboard.getCellState(0, 0)).toBe('hit');
		});

		it('returns "miss" for a no-ship cell', () => {
			gameboard.placeShip(2, 0, 0);
			gameboard.receiveAttack(1, 1);
			expect(gameboard.getCellState(1, 1)).toBe('miss');
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
			gameboard = new Gameboard(10);
		});

		it('throws error for invalid coordinates', () => {
			expect(() => gameboard.isCellAttacked()).toThrow(
				`Coordinates must be integers between 0 and ${BOARD_SIZE - 1}`
			);

			expect(() => gameboard.isCellAttacked(0)).toThrow(
				`Coordinates must be integers between 0 and ${BOARD_SIZE - 1}`
			);

			expect(() => gameboard.isCellAttacked(0, -1)).toThrow(
				`Coordinates must be integers between 0 and ${BOARD_SIZE - 1}`
			);

			expect(() => gameboard.isCellAttacked(10, 1)).toThrow(
				`Coordinates must be integers between 0 and ${BOARD_SIZE - 1}`
			);
		});

		it('returns true when a cell is attacked', () => {
			gameboard.receiveAttack(0, 0);
			expect(gameboard.isCellAttacked(0, 0)).toBe(true);
		});

		it('returns false when a cell is not attacked', () => {
			gameboard.receiveAttack(0, 0);
			expect(gameboard.isCellAttacked(1, 1)).toBe(false);
		});

		it("returns false when a cell is in sunk ships' buffer zone ", () => {
			gameboard.receiveAttack(0, 0);
			gameboard.receiveAttack(0, 1);

			expect(gameboard.isCellAttacked(1, 1)).toBe(false);
		});
	});
});
