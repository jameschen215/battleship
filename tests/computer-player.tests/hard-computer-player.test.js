import * as utils from '../../src/script/utils.js';
import { ComputerPlayer } from '../../src/script/computer-players/computer-player.js';
import { Gameboard } from '../../src/script/gameboard.js';
import { HardComputerPlayer } from '../../src/script/computer-players/hard-computer-player.js';

jest.mock('../../src/script/utils.js', () => ({
	shuffle: jest.fn(),
	getRandomInt: jest.fn(),
}));

describe('HardComputerPlayer', () => {
	let bot = null;
	let enemyBoard = null;

	beforeEach(() => {
		bot = new HardComputerPlayer();
		enemyBoard = new Gameboard();
		enemyBoard.placeShip(2, 0, 0, 'horizontal');
		enemyBoard.placeShip(2, 8, 9, 'vertical');
		enemyBoard.placeShip(4, 5, 5, 'horizontal');
		enemyBoard.placeShip(4, 2, 3, 'vertical');
	});

	afterEach(() => jest.resetAllMocks());

	describe('existence', () => {
		it('should be a defined class extended from ComputerPlayer', () => {
			expect(HardComputerPlayer).toBeDefined();
			expect(bot).toBeInstanceOf(HardComputerPlayer);
			expect(bot).toBeInstanceOf(ComputerPlayer);
		});
	});

	describe('constructor', () => {
		it('should initializes a bot with sunkShips', () => {
			expect(bot.sunkShips).toBeInstanceOf(Array);
			expect(bot.sunkShips.length).toBe(0);
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
		beforeEach(() => {
			bot.hitQueue.push([0, 0]);
			bot.attackedCoordinates.add(String([0, 0]));
			bot.attackingShipDirection = 'horizontal';
			bot.rightwardOrDownward = false;
			bot.goBack = true;
			bot.hitQueue.push({
				size: 2,
				direction: 'horizontal',
				positions: [
					[0, 0],
					[0, 1],
				],
			});

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

	describe('getRandomCoordinate', () => {
		beforeEach(() => {
			bot.sunkShips.push({
				size: 4,
				direction: 'vertical',
				positions: [
					[2, 3],
					[3, 3],
					[4, 3],
					[5, 3],
				],
			});
		});

		afterEach(() => jest.resetAllMocks());

		it('cannot return a coord that has been attacked', () => {
			bot.attackedCoordinates.add(JSON.stringify([4, 4]));

			jest
				.spyOn(utils, 'getRandomInt')
				.mockReturnValueOnce(4)
				.mockReturnValueOnce(4)
				.mockReturnValueOnce(0)
				.mockReturnValueOnce(0);

			expect(bot.getRandomCoordinate()).not.toEqual({ row: 4, col: 4 });
		});

		it('returns a coordinate not on ship buffer zone at the top left corner', () => {
			// Mock several hits on buffer zone
			jest
				.spyOn(utils, 'getRandomInt')
				.mockReturnValueOnce(1)
				.mockReturnValueOnce(2)
				.mockReturnValueOnce(9)
				.mockReturnValueOnce(1);

			expect(bot.getRandomCoordinate()).not.toEqual({ row: 1, col: 2 });
		});

		it('returns a coordinate not on ship buffer zone at the bottom right corner', () => {
			// Mock several hits on buffer zone
			jest
				.spyOn(utils, 'getRandomInt')
				.mockReturnValueOnce(6)
				.mockReturnValueOnce(4)
				.mockReturnValueOnce(9)
				.mockReturnValueOnce(1);

			expect(bot.getRandomCoordinate()).not.toEqual({ row: 6, col: 4 });
		});

		it('returns a coordinate not on ship buffer zone at the top right corner', () => {
			// Mock several hits on buffer zone
			jest
				.spyOn(utils, 'getRandomInt')
				.mockReturnValueOnce(1)
				.mockReturnValueOnce(4)
				.mockReturnValueOnce(9)
				.mockReturnValueOnce(1);

			expect(bot.getRandomCoordinate()).not.toEqual({ row: 1, col: 4 });
		});

		it('returns a coordinate not on ship buffer zone at the bottom left corner', () => {
			// Mock several hits on buffer zone
			jest
				.spyOn(utils, 'getRandomInt')
				.mockReturnValueOnce(6)
				.mockReturnValueOnce(2)
				.mockReturnValueOnce(9)
				.mockReturnValueOnce(1);
			expect(bot.getRandomCoordinate()).not.toEqual({ row: 6, col: 2 });
		});

		it('returns a coordinate not on ship buffer zone at left middle', () => {
			// Mock several hits on buffer zone
			jest
				.spyOn(utils, 'getRandomInt')
				.mockReturnValueOnce(3)
				.mockReturnValueOnce(2)
				.mockReturnValueOnce(9)
				.mockReturnValueOnce(1);
			expect(bot.getRandomCoordinate()).not.toEqual({ row: 3, col: 2 });
		});

		it('returns a coordinate not on ship buffer zone at top middle', () => {
			// Mock several hits on buffer zone
			jest
				.spyOn(utils, 'getRandomInt')
				.mockReturnValueOnce(1)
				.mockReturnValueOnce(3)
				.mockReturnValueOnce(9)
				.mockReturnValueOnce(1);
			expect(bot.getRandomCoordinate()).not.toEqual({ row: 1, col: 3 });
		});

		describe('returns a coordinate that has enough neighboring cells to accommodate the smallest remaining ship', () => {
			it('does not return a coordinate that has not enough neighboring cells to accommodate a 2-component long ship', () => {
				// Make a cell that has't neighbors whose state is empty
				bot.attackedCoordinates.add(JSON.stringify([1, 7])); // Up
				bot.attackedCoordinates.add(JSON.stringify([3, 7])); // Down
				bot.attackedCoordinates.add(JSON.stringify([2, 6])); // Left
				bot.attackedCoordinates.add(JSON.stringify([2, 8])); // Right

				// Mock to get coordinate (2, 7)
				jest
					.spyOn(utils, 'getRandomInt')
					.mockReturnValueOnce(2)
					.mockReturnValueOnce(7)
					.mockReturnValueOnce(1)
					.mockReturnValueOnce(4)
					.mockReturnValueOnce(0)
					.mockReturnValueOnce(0);

				expect(bot.getRandomCoordinate()).not.toEqual({ row: 2, col: 7 });
			});

			it('returns a coordinate that has enough neighboring cells to accommodate a 3-component long ship', () => {
				// Make a cell that has't neighbors whose state is empty
				bot.attackedCoordinates.add(JSON.stringify([3, 0])); // Up
				bot.attackedCoordinates.add(JSON.stringify([4, 1])); // Right

				// Mock to get coordinate (2, 7)
				jest
					.spyOn(utils, 'getRandomInt')
					.mockReturnValueOnce(4)
					.mockReturnValueOnce(0)
					.mockReturnValueOnce(1)
					.mockReturnValueOnce(4)
					.mockReturnValueOnce(0)
					.mockReturnValueOnce(0);

				expect(bot.getRandomCoordinate()).toEqual({ row: 4, col: 0 });
			});
		});
	});

	describe('attack', () => {
		it('attacks and hits, but does not sink any ship', () => {
			jest
				.spyOn(utils, 'getRandomInt')
				.mockReturnValueOnce(0)
				.mockReturnValueOnce(0);

			const expected = {
				row: 0,
				col: 0,
				result: { hit: true, sunk: false },
			};

			const result = bot.attack(enemyBoard);
			expect(result).toEqual(expected);
		});

		it('attacks, hits, and sinks a ship', () => {
			jest
				.spyOn(utils, 'getRandomInt')
				.mockReturnValueOnce(0)
				.mockReturnValueOnce(0);

			jest.spyOn(utils, 'shuffle').mockReturnValue([
				{ row: 0, col: 1 }, // Right, hit
				{ row: 0, col: -1 },
				{ row: 2, col: 0 },
				{ row: -1, col: 0 },
			]);

			const expectedResults = [
				{
					row: 0,
					col: 0,
					result: { hit: true, sunk: false },
				},
				{
					row: 0,
					col: 1,
					result: { hit: true, sunk: true },
				},
			];

			expectedResults.forEach((expected) => {
				const result = bot.attack(enemyBoard);
				expect(result).toEqual(expected);
			});
		});

		it('attacks at empty cells and misses', () => {
			jest
				.spyOn(utils, 'getRandomInt')
				.mockReturnValueOnce(9)
				.mockReturnValueOnce(0);

			const expected = {
				row: 9,
				col: 0,
				result: { hit: false, sunk: false },
			};

			const result = bot.attack(enemyBoard);
			expect(result).toEqual(expected);
		});
	});
});
