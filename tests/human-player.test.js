import { Gameboard } from '../src/script/gameboard.js';
import { Player } from '../src/script/player.js';
import { HumanPlayer } from '../src/script/human-player.js';

jest.mock('../src/script/constants.js', () => ({
	BOARD_SIZE: 5,
	SHIP_SIZES: [2, 3],
	SHIP_DIRECTIONS: ['horizontal', 'vertical'],
}));

describe('HumanPlayer', () => {
	describe('existence', () => {
		it('is a defined class extended from Player', () => {
			const human = new HumanPlayer();
			expect(human).toBeInstanceOf(HumanPlayer);
			expect(human).toBeInstanceOf(Player);
		});
	});

	describe('constructor', () => {
		it('initializes with a player name', () => {
			const human = new HumanPlayer();
			expect(human.name).toBe('Player');
		});
	});

	describe('has name getter and setter', () => {
		let human;

		beforeEach(() => {
			human = new HumanPlayer();
		});

		afterEach(() => jest.resetAllMocks());

		it('name getter returns a human name', () => {
			expect(human.name).toBe('Player');
		});

		it('name setter set a human name', () => {
			human.name = 'Tom';
			expect(human.name).toBe('Tom');
		});
	});

	describe('attack', () => {
		let human;
		let enemyBoard;

		beforeEach(() => {
			human = new HumanPlayer();
			enemyBoard = new Gameboard();
			enemyBoard.placeShip(3, 0, 0);
			enemyBoard.placeShip(2, 2, 0);
		});

		afterEach(() => jest.resetAllMocks());

		it('should attack on an enemy board', () => {
			expect(() => human.attack()).toThrow(
				'Must attack an enemy Gameboard instance'
			);

			expect(() => human.attack('board', 0, 0)).toThrow(
				'Must attack an enemy Gameboard instance'
			);
		});

		it('attacks and misses', () => {
			const result = human.attack(enemyBoard, 1, 0);
			expect(result).toEqual({
				row: 1,
				col: 0,
				result: { hit: false, sunk: false },
			});
			expect(enemyBoard.getCellState(1, 0)).toBe('miss');
		});

		it('attacks and hits but not sinks a ship', () => {
			const result = human.attack(enemyBoard, 0, 0);
			expect(result).toEqual({
				row: 0,
				col: 0,
				result: { hit: true, sunk: false },
			});

			expect(enemyBoard.getCellState(0, 0)).toBe('hit');
			expect(enemyBoard.allSunk()).toBe(false);
		});

		it('attacks, hits, and sinks a ship', () => {
			human.attack(enemyBoard, 2, 0);
			const result = human.attack(enemyBoard, 2, 1);

			expect(result).toEqual({
				row: 2,
				col: 1,
				result: { hit: true, sunk: true },
			});
			expect(enemyBoard.getCellState(2, 0)).toBe('hit');
			expect(enemyBoard.getCellState(2, 1)).toBe('hit');
		});
	});
});
