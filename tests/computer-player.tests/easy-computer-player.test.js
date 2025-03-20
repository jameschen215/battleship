import { EasyComputerPlayer } from '../../src/script/computer-players/easy-computer-player.js';
import { ComputerPlayer } from '../../src/script/computer-players/computer-player.js';
import { Gameboard } from '../../src/script/gameboard.js';

describe('EasyComputerPlayer', () => {
	describe('existence', () => {
		it('is a defined class extended from ComputerPlayer', () => {
			const bot = new EasyComputerPlayer();

			expect(EasyComputerPlayer).toBeDefined();
			expect(bot).toBeInstanceOf(EasyComputerPlayer);
			expect(bot).toBeInstanceOf(ComputerPlayer);
		});
	});

	describe('constructor', () => {
		it('initializes with a empty set named attackedCoordinates', () => {
			const bot = new EasyComputerPlayer();

			expect(bot.attackedCoordinates).toBeInstanceOf(Set);
			expect(bot.attackedCoordinates.size).toBe(0);
		});
	});

	describe('resetHistory', () => {
		it('resets attackedCoordinates to empty', () => {
			const bot = new EasyComputerPlayer();
			bot.attackedCoordinates.add(String([0, 1]));
			bot.resetHistory();

			expect(bot.attackedCoordinates.size).toBe(0);
		});
	});

	describe('attack', () => {
		let bot = null;
		let enemyBoard = null;

		beforeEach(() => {
			bot = new EasyComputerPlayer();
			enemyBoard = new Gameboard();
		});

		it('should attack on an Gameboard instance', () => {
			expect(() => bot.attack()).toThrow(
				'Must attack an enemy Gameboard instance'
			);

			expect(() => bot.attack('board')).toThrow(
				'Must attack an enemy Gameboard instance'
			);
		});

		it('should add attacked coordinates into attackedCoordinates', () => {
			jest
				.spyOn(Math, 'random')
				.mockReturnValueOnce(0.15)
				.mockReturnValueOnce(0.25);

			bot.attack(enemyBoard);

			expect(bot.attackedCoordinates.size).toBe(1);
			expect(bot.attackedCoordinates.has('1,2')).toBe(true);
		});

		it('attacks and misses', () => {
			jest
				.spyOn(Math, 'random')
				.mockReturnValueOnce(0.35)
				.mockReturnValueOnce(0.75);

			const result = bot.attack(enemyBoard);

			expect(enemyBoard.getCellState(3, 7)).toBe('miss');
			expect(result).toEqual({
				row: 3,
				col: 7,
				result: { hit: false, sunk: false },
			});
		});

		it('attacks and hits, but does not sink a ship', () => {
			enemyBoard.placeShip(2, 3, 7, 'vertical');

			jest
				.spyOn(Math, 'random')
				.mockReturnValueOnce(0.35)
				.mockReturnValueOnce(0.75);

			const result = bot.attack(enemyBoard);

			expect(enemyBoard.getCellState(3, 7)).toBe('hit');
			expect(result).toEqual({
				row: 3,
				col: 7,
				result: { hit: true, sunk: false },
			});
		});

		it('attacks, hits, and sink a ship', () => {
			enemyBoard.placeShip(2, 3, 7, 'vertical');

			jest
				.spyOn(Math, 'random')
				.mockReturnValueOnce(0.35)
				.mockReturnValueOnce(0.75)
				.mockReturnValueOnce(0.45)
				.mockReturnValueOnce(0.75);

			bot.attack(enemyBoard);
			const result = bot.attack(enemyBoard);

			expect(enemyBoard.getCellState(3, 7)).toBe('hit');
			expect(enemyBoard.getCellState(4, 7)).toBe('hit');
			expect(result).toEqual({
				row: 4,
				col: 7,
				result: { hit: true, sunk: true },
			});
		});
	});
});
