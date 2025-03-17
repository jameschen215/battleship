import { Player } from '../../src/script/player.js';
import { ComputerPlayer } from '../../src/script/computer-players/computer-player.js';

describe('ComputerPlayer', () => {
	describe('existence', () => {
		it('is a defined class extended from Player', () => {
			const bot = new ComputerPlayer();

			expect(ComputerPlayer).toBeDefined();
			expect(bot).toBeInstanceOf(ComputerPlayer);
			expect(bot).toBeInstanceOf(Player);
		});
	});

	describe('constructor', () => {
		it('initializes with a player name', () => {
			const bot = new ComputerPlayer('Eva');
			expect(bot.name).toBe('Eva');
		});
	});

	describe('name getter and setter', () => {
		const bot = new ComputerPlayer();
		expect(bot.name).toBe('Bot');

		bot.name = 'Ultra';
		expect(bot.name).toBe('Ultra');
	});

	describe('resetHistory', () => {
		it('throws an error when resetHistory is called directly', () => {
			const bot = new ComputerPlayer();
			expect(() => bot.resetHistory()).toThrow(
				'resetHistory method must be implemented by subclass'
			);
		});
	});

	describe('getRandomCoordinate', () => {
		it('throws an error when getRandomCoordinate is called directly', () => {
			const bot = new ComputerPlayer();
			expect(() => bot.getRandomCoordinate()).toThrow(
				'getRandomCoordinate method must be implemented by subclass'
			);
		});
	});
});
