import { Player } from '../src/script/player.js';
import { Gameboard } from '../src/script/gameboard.js';

jest.mock('../src/script/constants.js', () => ({
	BOARD_SIZE: 5,
	SHIP_SIZES: [2, 3],
	SHIP_DIRECTIONS: ['horizontal', 'vertical'],
}));

describe('Player', () => {
	describe('existence', () => {
		it('is a defined class', () => {
			expect(Player).toBeDefined();
			expect(typeof Player).toBe('function');
		});
	});

	describe('constructor', () => {
		it('initializes with a Gameboard instance', () => {
			const player = new Player();
			expect(player.gameboard).toBeInstanceOf(Gameboard);
			expect(player.gameboard.board.length).toBe(5);
		});
	});

	describe('placeShips', () => {
		let player;

		beforeEach(() => {
			player = new Player();
		});

		afterEach(() => jest.resetAllMocks());

		it('places the correct number of ships', () => {
			player.placeShips();
			expect(player.gameboard.ships.length).toBe(2);
		});

		it('place ships of the correct sizes', () => {
			player.placeShips();
			const placedSizes = player.gameboard.ships
				.map(({ ship }) => ship.size)
				.sort();

			expect(placedSizes).toEqual([2, 3]);
		});
	});

	describe('attack', () => {
		it('throws error when attack is called directly', () => {
			const player = new Player();
			const enemyBoard = new Gameboard();
			expect(() => player.attack(enemyBoard, 0, 0)).toThrow(
				'attack method must be implemented by subclass'
			);
		});
	});
});
