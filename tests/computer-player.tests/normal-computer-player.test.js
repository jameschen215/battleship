import * as utils from '../../src/script/utils.js';
import { NormalComputerPlayer } from '../../src/script/computer-players/normal-computer-player.js';
import { ComputerPlayer } from '../../src/script/computer-players/computer-player.js';
import { Gameboard } from '../../src/script/gameboard.js';

describe('NormalComputerPlayer', () => {
	describe('existence', () => {
		it('is a defined class extended from ComputerPlayer', () => {
			const bot = new NormalComputerPlayer();

			expect(NormalComputerPlayer).toBeDefined();
			expect(bot).toBeInstanceOf(NormalComputerPlayer);
			expect(bot).toBeInstanceOf(ComputerPlayer);
		});
	});

	describe('constructor', () => {
		let bot = null;

		beforeEach(() => {
			bot = new NormalComputerPlayer();
		});

		it('should initializes a bot with attackedCoordinates', () => {
			expect(bot.attackedCoordinates).toBeInstanceOf(Set);
			expect(bot.attackedCoordinates.size).toBe(0);
		});

		it('should initializes a bot with hitQueue', () => {
			expect(bot.hitQueue).toBeInstanceOf(Array);
			expect(bot.hitQueue.length).toBe(0);
		});

		it('should initializes a bot with attackingShipDirection', () => {
			expect(bot.attackingShipDirection).toBeDefined();
			expect(bot.attackingShipDirection).toBe('');
		});

		it('should initializes a bot with rightwardOrDownward', () => {
			expect(bot.rightwardOrDownward).toBeDefined();
			expect(bot.rightwardOrDownward).toBe(true);
		});

		it('should initializes a bot with goBack', () => {
			expect(bot.goBack).toBeDefined();
			expect(bot.goBack).toBe(false);
		});
	});

	describe('resetHistory', () => {
		let bot = null;

		beforeEach(() => {
			bot = new NormalComputerPlayer();

			bot.hitQueue.push([0, 0]);
			bot.attackedCoordinates.add(String([0, 0]));
			bot.attackingShipDirection = 'horizontal';
			bot.rightwardOrDownward = false;
			bot.goBack = true;

			bot.resetHistory();
		});

		it('should reset hitQueue to empty', () => {
			expect(bot.hitQueue.length).toBe(0);
		});

		it('should reset attackedCoordinates to empty', () => {
			expect(bot.attackedCoordinates.size).toBe(0);
		});

		it('should reset attackingShipDirection to ""', () => {
			expect(bot.attackingShipDirection).toBe('');
		});

		it('should reset rightwardOrDownward to true', () => {
			expect(bot.rightwardOrDownward).toBe(true);
		});

		it('should reset goBack to false', () => {
			expect(bot.goBack).toBe(false);
		});
	});

	// test attack
	// jest.mock('../../src/script/utils.js', () => ({
	// 	shuffle: jest.fn(),
	// 	getRandomInt: jest.fn(),
	// }));

	describe('attack', () => {
		let bot = null;
		let enemyBoard = null;

		beforeEach(() => {
			bot = new NormalComputerPlayer();
			enemyBoard = new Gameboard();
			enemyBoard.placeShip(2, 0, 0, 'horizontal');
			enemyBoard.placeShip(2, 8, 9, 'vertical');
			enemyBoard.placeShip(4, 5, 5, 'horizontal');
			enemyBoard.placeShip(4, 2, 3, 'vertical');
		});

		afterEach(() => jest.resetAllMocks());

		describe('parameter', () => {
			it('should attack on enemy board', () => {
				expect(() => bot.attack()).toThrow(
					'Must attack an enemy Gameboard instance'
				);

				expect(() => bot.attack('board', 0, 0)).toThrow(
					'Must attack an enemy Gameboard instance'
				);
			});
		});

		describe('miss', () => {
			it('attacks a cell and misses', () => {
				jest
					.spyOn(utils, 'getRandomInt')
					.mockReturnValueOnce(4)
					.mockReturnValueOnce(4);

				const expected = {
					row: 4,
					col: 4,
					result: { hit: false, sunk: false },
				};
				const result = bot.attack(enemyBoard);

				expect(result).toEqual(expected);
				expect(enemyBoard.getCellState(4, 4)).toBe('miss');
				expect(enemyBoard.ships[0].ship.hits).toBe(0);

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
		});

		describe('hit and sink', () => {
			it('hit a ship and then attacks its all neighbors', () => {
				// Mock to the first hit - (5, 5)
				jest
					.spyOn(utils, 'getRandomInt')
					.mockReturnValueOnce(5)
					.mockReturnValueOnce(5);

				// Mock the hits on neighbors
				jest.spyOn(utils, 'shuffle').mockReturnValue([
					{ row: 6, col: 5 }, // Up
					{ row: 4, col: 5 }, // Down
					{ row: 5, col: 4 }, // Lef
					{ row: 5, col: 6 }, // Right
				]);

				const expectedResults = [
					{ row: 5, col: 5, result: { hit: true, sunk: false } },
					{ row: 6, col: 5, result: { hit: false, sunk: false } },
					{ row: 4, col: 5, result: { hit: false, sunk: false } },
					{ row: 5, col: 4, result: { hit: false, sunk: false } },
					{ row: 5, col: 6, result: { hit: true, sunk: false } },
				];

				expectedResults.forEach((expected) => {
					const result = bot.attack(enemyBoard);
					expect(result).toEqual(expected);
				});
			});

			it('hits the first two components of a horizontal ship, and attempts to target the remaining components horizontally, ultimately sinking it', () => {
				// Mock the first attack on (5, 5)
				jest
					.spyOn(utils, 'getRandomInt')
					.mockReturnValueOnce(5)
					.mockReturnValueOnce(5);

				// Mock the second hit on (5, 6)
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
					const result = bot.attack(enemyBoard);
					expect(result).toEqual(expected);
				});
			});

			it('hits the first two components of a vertical ship, then attempts to target the remaining components vertically, ultimately sinking the ship', () => {
				// Mock the first attack on coordinate (2, 3)
				jest
					.spyOn(utils, 'getRandomInt')
					.mockReturnValueOnce(2)
					.mockReturnValueOnce(3);

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
					const result = bot.attack(enemyBoard);
					expect(result).toEqual(expected);
				});
			});

			it('hits the last two components of a horizontal ship, then attempts to target the remaining components horizontally, ultimately sinking the ship', () => {
				// Mock the first hit on (5, 8)
				jest
					.spyOn(utils, 'getRandomInt')
					.mockReturnValueOnce(5)
					.mockReturnValueOnce(8);

				// Mock the second hit on (5, 7)
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
					const result = bot.attack(enemyBoard);
					expect(result).toEqual(expected);
				});
			});

			it('hits the last two components of a vertical ship, then attempts to target the remaining components vertically, ultimately sinking the ship', () => {
				// Mock the first hit on (5, 3)
				jest
					.spyOn(utils, 'getRandomInt')
					.mockReturnValueOnce(5)
					.mockReturnValueOnce(3);

				// Mock the second hit on (4, 3)
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
					const result = bot.attack(enemyBoard);
					expect(result).toEqual(expected);
				});
			});

			it('hits two middle components of a ship horizontally, then attempts to target the remaining components on both sides, ultimately sinking the ship', () => {
				// Mock the first attack on (5, 6) - the middle one
				jest
					.spyOn(utils, 'getRandomInt')
					.mockReturnValueOnce(5)
					.mockReturnValueOnce(6);

				// Mock the second hit on (5, 7)
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
					const result = bot.attack(enemyBoard);
					expect(result).toEqual(expected);
				});
			});

			it('hits tow middle components of a ship vertically, then attempts to target the remaining components on both sides, ultimately sinking the ship', () => {
				// Mock the first attack on (4, 3) - the middle one
				jest
					.spyOn(utils, 'getRandomInt')
					.mockReturnValueOnce(4)
					.mockReturnValueOnce(3);

				// Mock the second hit on (3, 3) - the other middle one
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
					const result = bot.attack(enemyBoard);
					expect(result).toEqual(expected);
				});
			});
		});
	});
});
