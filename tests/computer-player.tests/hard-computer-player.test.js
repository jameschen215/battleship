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
		enemyBoard.placeShip(5, 0, 5, 'horizontal');
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

		it("attacks a ship's first component and follows its direction until sunk", () => {
			jest
				.spyOn(utils, 'getRandomInt')
				.mockReturnValueOnce(5)
				.mockReturnValueOnce(5);

			jest.spyOn(utils, 'shuffle').mockReturnValue([
				{ row: 5, col: 6 }, // Right
				{ row: 6, col: 5 }, // Down
				{ row: 5, col: 4 }, // Left
				{ row: 4, col: 5 }, // Up
			]);

			// Expected sequence: hit {5, 5}, then follow horizontal ship to {5, 6}, {5, 7}, {5, 8}
			const expectedAttacks = [
				{ row: 5, col: 5, result: { hit: true, sunk: false } },
				{ row: 5, col: 6, result: { hit: true, sunk: false } },
				{ row: 5, col: 7, result: { hit: true, sunk: false } },
				{ row: 5, col: 8, result: { hit: true, sunk: true } },
			];

			const attackResults = [];
			for (let i = 0; i < 4; i++) {
				const result = bot.attack(enemyBoard);
				attackResults.push(result);
			}

			expect(attackResults).toEqual(expectedAttacks);
		});

		it("attacks a ship's first component and attacks other 3 neighbors until the direction is found, and follows the direction until sunk", () => {
			jest
				.spyOn(utils, 'getRandomInt')
				.mockReturnValueOnce(5)
				.mockReturnValueOnce(5);

			jest.spyOn(utils, 'shuffle').mockReturnValue([
				{ row: 6, col: 5 }, // Down
				{ row: 5, col: 4 }, // Left
				{ row: 4, col: 5 }, // Up
				{ row: 5, col: 6 }, // Right
			]);

			// Expected sequence: hit {5, 5}, then follow horizontal ship to {5, 6}, {5, 7}, {5, 8}
			const expectedAttacks = [
				{ row: 5, col: 5, result: { hit: true, sunk: false } },
				{ row: 6, col: 5, result: { hit: false, sunk: false } },
				{ row: 5, col: 4, result: { hit: false, sunk: false } },
				{ row: 4, col: 5, result: { hit: false, sunk: false } },
				{ row: 5, col: 6, result: { hit: true, sunk: false } },
				{ row: 5, col: 7, result: { hit: true, sunk: false } },
				{ row: 5, col: 8, result: { hit: true, sunk: true } },
			];

			const attackResults = [];
			for (let i = 0; i < 7; i++) {
				const result = bot.attack(enemyBoard);
				attackResults.push(result);
			}

			expect(attackResults).toEqual(expectedAttacks);
		});

		it("attacks a ship's last component and follows its direction until sunk", () => {
			jest
				.spyOn(utils, 'getRandomInt')
				.mockReturnValueOnce(5)
				.mockReturnValueOnce(3);

			jest.spyOn(utils, 'shuffle').mockReturnValue([
				{ row: 4, col: 3 }, // Up
				{ row: 6, col: 3 }, // Down
				{ row: 5, col: 2 }, // Left
				{ row: 5, col: 4 }, // Right
			]);

			// Expected sequence: hit {5, 3}, then follow horizontal ship to {5, 6}, {5, 7}, {5, 8}
			const expectedAttacks = [
				{ row: 5, col: 3, result: { hit: true, sunk: false } },
				{ row: 4, col: 3, result: { hit: true, sunk: false } },
				{ row: 3, col: 3, result: { hit: true, sunk: false } },
				{ row: 2, col: 3, result: { hit: true, sunk: true } },
			];

			const attackResults = [];
			for (let i = 0; i < 4; i++) {
				const result = bot.attack(enemyBoard);
				attackResults.push(result);
			}

			expect(attackResults).toEqual(expectedAttacks);
		});

		it("attacks a ship's last component and attacks other 3 neighbors until the direction is found, and follows the direction until sunk", () => {
			jest
				.spyOn(utils, 'getRandomInt')
				.mockReturnValueOnce(5)
				.mockReturnValueOnce(3);

			jest.spyOn(utils, 'shuffle').mockReturnValue([
				{ row: 6, col: 3 }, // Down
				{ row: 5, col: 2 }, // Left
				{ row: 5, col: 4 }, // Right
				{ row: 4, col: 3 }, // Up - hit
			]);

			// Expected sequence: hit {5, 3}, then follow horizontal ship to {5, 6}, {5, 7}, {5, 8}
			const expectedAttacks = [
				{ row: 5, col: 3, result: { hit: true, sunk: false } },
				{ row: 6, col: 3, result: { hit: false, sunk: false } },
				{ row: 5, col: 2, result: { hit: false, sunk: false } },
				{ row: 5, col: 4, result: { hit: false, sunk: false } },
				{ row: 4, col: 3, result: { hit: true, sunk: false } },
				{ row: 3, col: 3, result: { hit: true, sunk: false } },
				{ row: 2, col: 3, result: { hit: true, sunk: true } },
			];

			const attackResults = [];
			for (let i = 0; i < 7; i++) {
				const result = bot.attack(enemyBoard);
				attackResults.push(result);
			}

			expect(attackResults).toEqual(expectedAttacks);
		});

		it("attacks a ship's middle component and follows its direction until ship end, and go back to the middle one, going the opposite direction until sunk", () => {
			jest
				.spyOn(utils, 'getRandomInt')
				.mockReturnValueOnce(5)
				.mockReturnValueOnce(7);

			jest.spyOn(utils, 'shuffle').mockReturnValue([
				{ row: 5, col: 8 }, // Right - hit
				{ row: 6, col: 7 }, // Down
				{ row: 5, col: 6 }, // Left
				{ row: 4, col: 7 }, // Up
			]);

			// Expected sequence: hit {5, 7}, then follow horizontal ship to {5, 8}, {5, 6}, {5, 5}
			const expectedAttacks = [
				{ row: 5, col: 7, result: { hit: true, sunk: false } },
				{ row: 5, col: 8, result: { hit: true, sunk: false } },
				{ row: 5, col: 9, result: { hit: false, sunk: false } },
				{ row: 5, col: 6, result: { hit: true, sunk: false } },
				{ row: 5, col: 5, result: { hit: true, sunk: true } },
			];

			const attackResults = [];
			for (let i = 0; i < 5; i++) {
				const result = bot.attack(enemyBoard);
				attackResults.push(result);
			}

			expect(attackResults).toEqual(expectedAttacks);
		});

		it("attacks a ship's middle component and follows its direction until ship end that is an invalid coord, and go back to the middle one, going the opposite direction until sunk", () => {
			jest
				.spyOn(utils, 'getRandomInt')
				.mockReturnValueOnce(0)
				.mockReturnValueOnce(7);

			jest.spyOn(utils, 'shuffle').mockReturnValue([
				{ row: 0, col: 8 }, // Right - hit
				{ row: 1, col: 7 }, // Down
				{ row: 0, col: 6 }, // Left
				{ row: -1, col: 7 }, // Up
			]);

			// Expected sequence: hit {0, 7}, then follow horizontal ship to {0, 8}, {0, 9}, {0, 6}, {0, 5}
			const expectedAttacks = [
				{ row: 0, col: 7, result: { hit: true, sunk: false } },
				{ row: 0, col: 8, result: { hit: true, sunk: false } },
				{ row: 0, col: 9, result: { hit: true, sunk: false } },
				{ row: 0, col: 6, result: { hit: true, sunk: false } },
				{ row: 0, col: 5, result: { hit: true, sunk: true } },
			];

			const attackResults = [];
			for (let i = 0; i < 5; i++) {
				const result = bot.attack(enemyBoard);
				attackResults.push(result);
			}

			expect(attackResults).toEqual(expectedAttacks);
		});

		it("refuse to attack on sunk ship's buffer zone", () => {
			jest
				.spyOn(utils, 'getRandomInt')
				.mockReturnValueOnce(0)
				.mockReturnValueOnce(0)
				.mockReturnValueOnce(1)
				.mockReturnValueOnce(0)
				.mockReturnValueOnce(1)
				.mockReturnValueOnce(2)
				.mockReturnValueOnce(0)
				.mockReturnValueOnce(2)
				.mockReturnValueOnce(5)
				.mockReturnValueOnce(6);

			jest.spyOn(utils, 'shuffle').mockReturnValue([
				{ row: 0, col: 1 }, // Right - hit
				{ row: 0, col: -1 }, // Left
				{ row: -1, col: 0 }, // Up
				{ row: 1, col: 0 }, // Down
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
				// refuse to attack (1, 0), (1, 2), (0, 2)
				{
					row: 5,
					col: 6,
					result: { hit: true, sunk: false },
				},
			];

			expectedResults.forEach((expected) => {
				expect(bot.attack(enemyBoard)).toEqual(expected);
			});
		});
	});
});
