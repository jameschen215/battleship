import { Player } from '../src/script/player.js';
import { ComputerPlayer } from '../src/script/computer-player.js';
import { Gameboard } from '../src/script/gameboard.js';
import * as utils from '../src/script/utils.js';

jest.mock('../src/script/constants.js', () => ({
	BOARD_SIZE: 10,
	SHIP_SIZES: [2, 3, 3, 4, 5],
	SHIP_DIRECTIONS: ['horizontal', 'vertical'],
}));

jest.mock('../src/script/utils.js', () => ({
	shuffle: jest.fn(),
	getRandomInt: jest.fn(),
}));

/** ------------------  ComputerPlayer test ------------------ */
describe('ComputerPlayer', () => {
	describe('existence', () => {
		it('is a defined class extended from Player', () => {
			const computerPlayer = new ComputerPlayer();
			expect(computerPlayer).toBeInstanceOf(ComputerPlayer);
			expect(computerPlayer).toBeInstanceOf(Player);
		});
	});

	describe('constructor', () => {
		it('initializes with a player name', () => {
			const bot = new ComputerPlayer();
			expect(bot.name).toBe('Bot');
		});
	});

	describe('getRandomAttackingCoordinate', () => {
		let bot;
		beforeEach(() => {
			bot = new ComputerPlayer();
		});
		it('returns a random coordinate object', () => {
			jest
				.spyOn(utils, 'getRandomInt')
				.mockReturnValueOnce(0)
				.mockReturnValueOnce(9);

			const coordinate = bot.getRandomAttackingCoordinate();
			expect(typeof coordinate).toBe('object');
			expect(Object.keys(coordinate).length).toBe(2);
			expect(coordinate.row).toBe(0);
			expect(coordinate.col).toBe(9);
		});
		it('returns a random coordinate object on board', () => {
			jest
				.spyOn(utils, 'getRandomInt')
				.mockReturnValueOnce(0)
				.mockReturnValueOnce(9);

			const coordinate = bot.getRandomAttackingCoordinate();

			expect(coordinate.row).toBeGreaterThanOrEqual(0);
			expect(coordinate.row).toBeLessThan(10);
			expect(coordinate.col).toBeGreaterThanOrEqual(0);
			expect(coordinate.col).toBeLessThan(10);
		});

		it('returns a random coordinate which is not attacked', () => {
			jest
				.spyOn(utils, 'getRandomInt')
				.mockReturnValueOnce(0)
				.mockReturnValueOnce(9)
				.mockReturnValueOnce(5)
				.mockReturnValueOnce(4);

			const coordinate1 = bot.getRandomAttackingCoordinate();
			const coordinate2 = bot.getRandomAttackingCoordinate();

			expect(coordinate1).not.toEqual(coordinate2);
		});
	});

	describe('smartAttack', () => {
		let bot = null;
		let enemyBoard = null;

		beforeEach(() => {
			bot = new ComputerPlayer();
			enemyBoard = new Gameboard();
			enemyBoard.placeShip(2, 0, 0, 'horizontal');
			enemyBoard.placeShip(2, 8, 9, 'vertical');
			enemyBoard.placeShip(4, 5, 5, 'horizontal');
			enemyBoard.placeShip(4, 2, 3, 'vertical');
		});

		afterEach(() => jest.resetAllMocks());

		it('should attack on enemy board', () => {
			expect(() => bot.smartAttack()).toThrow(
				'Must attack an enemy Gameboard instance'
			);

			expect(() => bot.smartAttack('board', 0, 0)).toThrow(
				'Must attack an enemy Gameboard instance'
			);
		});

		it('attacks a random un-attacked cell and hits a ship', () => {
			jest
				.spyOn(utils, 'getRandomInt')
				.mockReturnValueOnce(0)
				.mockReturnValueOnce(0);

			const result = bot.smartAttack(enemyBoard);
			expect(result).toEqual({
				row: 0,
				col: 0,
				result: { hit: true, sunk: false },
			});
			expect(enemyBoard.getCellState(0, 0)).toBe('hit');
		});

		it('attacks an empty un-attacked cell and misses', () => {
			jest
				.spyOn(utils, 'getRandomInt')
				.mockReturnValueOnce(4)
				.mockReturnValueOnce(4);

			const result = bot.smartAttack(enemyBoard);
			expect(result).toEqual({
				row: 4,
				col: 4,
				result: { hit: false, sunk: false },
			});

			expect(enemyBoard.getCellState(4, 4)).toBe('miss');
			expect(enemyBoard.ships[0].ship.getHits()).toBe(0);

			enemyBoard.board.forEach((row, i) => {
				row.forEach((cell, j) => {
					if (i === 4 && j === 4) {
						expect(cell.state).toBe('miss');
					} else {
						expect(cell.state).toBe('empty');
					}
				});
			});
		});

		it('avoids attacking an already attacked cell', () => {
			// Mock coordinates: first try (0, 0), then (1, 1)
			bot.getRandomAttackingCoordinate = jest
				.fn()
				.mockReturnValueOnce({ row: 0, col: 0 })
				.mockReturnValueOnce({ row: 0, col: 0 });

			jest.spyOn(utils, 'shuffle').mockReturnValue([
				{ row: 0, col: -1 },
				{ row: 0, col: 1 },
				{ row: -1, col: 0 },
				{ row: 1, col: 0 },
			]);

			bot.smartAttack(enemyBoard);
			const { row, col } = bot.smartAttack(enemyBoard);

			const coordinate = { row, col };
			expect(coordinate).not.toEqual({ row: 0, col: 0 });
			expect(enemyBoard.getCellState(0, 0)).toBe('hit');
		});

		it("hit a ship and then attacks the hit cell's all neighbors", () => {
			// Mock getRandomAttackingCoordinate to hit (5,5)
			bot.getRandomAttackingCoordinate = jest
				.fn()
				.mockReturnValue({ row: 5, col: 5 });

			// Mock shuffle to return a specific order of adjacent cells
			jest.spyOn(utils, 'shuffle').mockReturnValue([
				{ row: 6, col: 5 }, // Up
				{ row: 4, col: 5 }, // Down
				{ row: 5, col: 4 }, // Lef
				{ row: 5, col: 6 }, // Right
			]);

			const neighbors = [
				{ row: 6, col: 5, result: { hit: false, sunk: false } },
				{ row: 4, col: 5, result: { hit: false, sunk: false } },
				{ row: 5, col: 4, result: { hit: false, sunk: false } },
				{ row: 5, col: 6, result: { hit: true, sunk: false } },
			];

			// First attack at (5,5) - should hit
			bot.smartAttack(enemyBoard); // Attack (5, 5)

			// Second attack - should try an adjacent cell
			const result = bot.smartAttack(enemyBoard);

			// Check if the result matches one of the expected neighbors
			expect(neighbors).toContainEqual(result);
		});

		it('hits the first two components of a horizontal ship, and attempts to target the remaining components horizontally, ultimately sinking it', () => {
			// Mock the first attack on coordinate (5, 5)
			bot.getRandomAttackingCoordinate = jest
				.fn()
				.mockReturnValue({ row: 5, col: 5 });

			// Mock shuffle to return a specific order of adjacent cells
			jest.spyOn(utils, 'shuffle').mockReturnValue([
				{ row: 5, col: 6 }, // Right, hit
				{ row: 6, col: 5 }, // Down
				{ row: 5, col: 4 }, // Left
				{ row: 4, col: 5 }, // Up
			]);

			const expectedResults = [
				{
					row: 5,
					col: 5,
					result: { hit: true, sunk: false },
				},
				{
					row: 5,
					col: 6,
					result: { hit: true, sunk: false },
				},
				{
					row: 5,
					col: 7,
					result: { hit: true, sunk: false },
				},
				{
					row: 5,
					col: 8,
					result: { hit: true, sunk: true },
				},
			];

			expectedResults.forEach((expected) => {
				const result = bot.smartAttack(enemyBoard);
				expect(result).toEqual(expected);
			});
		});

		it('hits the first two components of a vertical ship, then attempts to target the remaining components vertically, ultimately sinking the ship', () => {
			// Mock the first attack on coordinate (3, 3)
			bot.getRandomAttackingCoordinate = jest
				.fn()
				.mockReturnValue({ row: 2, col: 3 });

			// Mock shuffle to return a specific order of adjacent cells
			jest.spyOn(utils, 'shuffle').mockReturnValue([
				{ row: 3, col: 3 }, // Down, hit
				{ row: 2, col: 2 }, // Right
				{ row: 2, col: 4 }, // Left
				{ row: 1, col: 3 }, // Up
			]);

			const expectedResults = [
				{
					row: 2,
					col: 3,
					result: { hit: true, sunk: false },
				},
				{
					row: 3,
					col: 3,
					result: { hit: true, sunk: false },
				},
				{
					row: 4,
					col: 3,
					result: { hit: true, sunk: false },
				},
				{
					row: 5,
					col: 3,
					result: { hit: true, sunk: true },
				},
			];

			expectedResults.forEach((expected) => {
				const result = bot.smartAttack(enemyBoard);
				expect(result).toEqual(expected);
			});
		});

		it('hits the last two components of a horizontal ship, then attempts to target the remaining components horizontally, ultimately sinking the ship', () => {
			// Mock the last component of the ship - (5, 8)
			bot.getRandomAttackingCoordinate = jest
				.fn()
				.mockReturnValue({ row: 5, col: 8 });

			// Mock shuffle to return a specific order of
			// adjacent cells starting with (5, 7)
			jest.spyOn(utils, 'shuffle').mockReturnValue([
				{ row: 5, col: 7 }, // Left, hit
				{ row: 5, col: 9 }, // Right
				{ row: 4, col: 8 }, // Up
				{ row: 6, col: 8 }, // Down
			]);

			const expectedResults = [
				{
					row: 5,
					col: 8,
					result: { hit: true, sunk: false },
				},
				{
					row: 5,
					col: 7,
					result: { hit: true, sunk: false },
				},
				{
					row: 5,
					col: 6,
					result: { hit: true, sunk: false },
				},
				{
					row: 5,
					col: 5,
					result: { hit: true, sunk: true },
				},
			];

			expectedResults.forEach((expected) => {
				const result = bot.smartAttack(enemyBoard);
				expect(result).toEqual(expected);
			});
		});

		it('hits the last two components of a vertical ship, then attempts to target the remaining components vertically, ultimately sinking the ship', () => {
			// Mock the last component of the ship - (5, 3)
			bot.getRandomAttackingCoordinate = jest
				.fn()
				.mockReturnValue({ row: 5, col: 3 });

			// Mock shuffle to return a specific order of
			// adjacent cells starting with (4, 3)
			jest.spyOn(utils, 'shuffle').mockReturnValue([
				{ row: 4, col: 3 }, // Up, hit
				{ row: 6, col: 3 }, // Down
				{ row: 5, col: 2 }, // Left
				{ row: 5, col: 4 }, // Right
			]);

			const expectedResults = [
				{
					row: 5,
					col: 3,
					result: { hit: true, sunk: false },
				},
				{
					row: 4,
					col: 3,
					result: { hit: true, sunk: false },
				},
				{
					row: 3,
					col: 3,
					result: { hit: true, sunk: false },
				},
				{
					row: 2,
					col: 3,
					result: { hit: true, sunk: true },
				},
			];

			expectedResults.forEach((expected) => {
				const result = bot.smartAttack(enemyBoard);
				expect(result).toEqual(expected);
			});
		});

		it('hits two middle components of a ship horizontally, then attempts to target the remaining components on both sides, ultimately sinking the ship', () => {
			// Mock the first attack on coordinate (5, 6) - the middle one
			bot.getRandomAttackingCoordinate = jest
				.fn()
				.mockReturnValue({ row: 5, col: 6 });

			// Mock shuffle to return a specific order of
			// adjacent cells starting with (5, 7)
			jest.spyOn(utils, 'shuffle').mockReturnValue([
				{ row: 5, col: 7 }, // hit
				{ row: 4, col: 6 },
				{ row: 6, col: 6 },
				{ row: 5, col: 5 },
			]);

			const expectedResults = [
				{
					row: 5,
					col: 6,
					result: { hit: true, sunk: false },
				},
				{
					row: 5,
					col: 7,
					result: { hit: true, sunk: false },
				},
				{
					row: 5,
					col: 8,
					result: { hit: true, sunk: false },
				},
				{
					row: 5,
					col: 9,
					result: { hit: false, sunk: false },
				},
				{
					row: 5,
					col: 5,
					result: { hit: true, sunk: true },
				},
			];

			expectedResults.forEach((expected) => {
				const result = bot.smartAttack(enemyBoard);
				expect(result).toEqual(expected);
			});
		});

		it('hits tow middle components of a ship vertically, then attempts to target the remaining components on both sides, ultimately sinking the ship', () => {
			// Mock the first attack on coordinate (4, 3) - the middle one
			bot.getRandomAttackingCoordinate = jest
				.fn()
				.mockReturnValue({ row: 4, col: 3 });

			// Mock shuffle to return a specific order of adjacent cells
			// starting with (3, 3) - another middle one
			jest.spyOn(utils, 'shuffle').mockReturnValue([
				{ row: 5, col: 3 }, // hit
				{ row: 3, col: 3 },
				{ row: 4, col: 2 },
				{ row: 4, col: 4 },
			]);

			const expectedResults = [
				{
					row: 4,
					col: 3,
					result: { hit: true, sunk: false },
				},
				{
					row: 5,
					col: 3,
					result: { hit: true, sunk: false },
				},
				{
					row: 6,
					col: 3,
					result: { hit: false, sunk: false },
				},
				{
					row: 3,
					col: 3,
					result: { hit: true, sunk: false },
				},
				{
					row: 2,
					col: 3,
					result: { hit: true, sunk: true },
				},
			];

			expectedResults.forEach((expected) => {
				const result = bot.smartAttack(enemyBoard);
				expect(result).toEqual(expected);
			});
		});

		it('hits a 2-component horizontal ship, and sinks it', () => {
			// Mock the first hit
			bot.getRandomAttackingCoordinate = jest
				.fn()
				.mockReturnValue({ row: 0, col: 0 });

			// Mock the second hit
			jest.spyOn(utils, 'shuffle').mockReturnValue([
				{ row: -1, col: 0 }, // Up
				{ row: 1, col: 0 }, // Down
				{ row: 0, col: -1 }, // Left
				{ row: 0, col: 1 }, // Right
			]);

			const expectedResults = [
				{
					row: 0,
					col: 0,
					result: { hit: true, sunk: false },
				},
				{
					row: 1,
					col: 0,
					result: { hit: false, sunk: false },
				},
				{
					row: 0,
					col: 1,
					result: { hit: true, sunk: true },
				},
			];

			expectedResults.forEach((expected) => {
				const result = bot.smartAttack(enemyBoard);
				expect(result).toEqual(expected);
			});
		});

		it('hits a 2-component vertical ship, and sinks it', () => {
			// Mock the first hit on (8, 9)
			bot.getRandomAttackingCoordinate = jest
				.fn()
				.mockReturnValue({ row: 8, col: 9 });

			// Mock the second hit on or off target
			jest.spyOn(utils, 'shuffle').mockReturnValue([
				{ row: 7, col: 9 }, // Up
				{ row: 8, col: 8 }, // Left
				{ row: 9, col: 9 }, // Down
				{ row: 8, col: 10 }, // Right
			]);

			const expectedResults = [
				{ row: 8, col: 9, result: { hit: true, sunk: false } },
				{ row: 7, col: 9, result: { hit: false, sunk: false } },
				{ row: 8, col: 8, result: { hit: false, sunk: false } },
				{ row: 9, col: 9, result: { hit: true, sunk: true } },
			];

			expectedResults.forEach((expected) => {
				const result = bot.smartAttack(enemyBoard);
				expect(result).toEqual(expected);
			});
		});
	});

	/*
	describe('attack', () => {
		let bot;
		let enemyBoard;

		beforeEach(() => {
			bot = new ComputerPlayer();
			enemyBoard = new Gameboard();
			enemyBoard.placeShip(2, 0, 0);
		});

		afterEach(() => jest.resetAllMocks());


		it('finds an un-attacked cell on a nearly full board', () => {
			// Mark all cells except (4, 4) as attacked
			for (let row = 0; row < BOARD_SIZE; row++) {
				for (let col = 0; col < BOARD_SIZE; col++) {
					if (row !== 4 || col !== 4) {
						enemyBoard.receiveAttack(row, col);
					}
				}
			}

			// Mock Math.random: first try (0, 0), then (4, 4)
			jest
				.spyOn(Math, 'random')
				.mockReturnValueOnce(0.05)
				.mockReturnValueOnce(0.05)
				.mockReturnValueOnce(0.81)
				.mockReturnValueOnce(0.81);

			const result = bot.attack(enemyBoard);
			expect(result).toEqual({ hit: false, sunk: false });

			expect(enemyBoard.getCellState(4, 4)).toBe('miss');
		});
	});
  */
});
