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
		it('returns a coordinate not on ship buffer zone', () => {
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

			// Mock several hits on buffer zone
			jest
				.spyOn(utils, 'getRandomInt')
				.mockReturnValueOnce(1)
				.mockReturnValueOnce(2)
				.mockReturnValueOnce(1)
				.mockReturnValueOnce(4)
				.mockReturnValueOnce(6)
				.mockReturnValueOnce(2)
				.mockReturnValueOnce(6)
				.mockReturnValueOnce(4);

			expect(bot.getRandomCoordinate()).not.toEqual({ row: 1, col: 2 });
			expect(bot.getRandomCoordinate()).not.toEqual({ row: 1, col: 4 });
			expect(bot.getRandomCoordinate()).not.toEqual({ row: 6, col: 2 });
			expect(bot.getRandomCoordinate()).not.toEqual({ row: 6, col: 4 });
		});
	});

	// test attack
	describe('attack', () => {
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
	});
});
