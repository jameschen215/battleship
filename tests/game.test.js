import { BOARD_SIZE, SHIP_SIZES } from '../src/script/constants.js';
import { Game } from '../src/script/game.js';
import { Gameboard } from '../src/script/gameboard.js';
import { HumanPlayer, ComputerPlayer } from '../src/script/player.js';

jest.mock('../src/script/constants.js', () => ({
	BOARD_SIZE: 2,
	SHIP_SIZES: [2, 2],
}));

describe('Game', () => {
	describe('existence', () => {
		it('is a defined class', () => {
			expect(Game).toBeDefined();
			expect(typeof Game).toBe('function');
		});
	});

	describe('constructor', () => {
		it('creates two players and create gameboard for each', () => {
			const game = new Game();

			expect(game.human).toBeInstanceOf(HumanPlayer);
			expect(game.bot).toBeInstanceOf(ComputerPlayer);

			expect(game.human.gameboard).toBeInstanceOf(Gameboard);
			expect(game.bot.gameboard).toBeInstanceOf(Gameboard);

			game.human.gameboard.board.flat().forEach((cell) => {
				expect(cell.state).toBe('empty');
			});

			game.bot.gameboard.board.flat().forEach((cell) => {
				expect(cell.state).toBe('empty');
			});
		});
	});

	describe('initializeGame', () => {
		let game;

		beforeEach(() => {
			game = new Game();
			game.initializeGame();
		});

		afterEach(() => jest.resetAllMocks());

		it('assigns the current player', () => {
			expect(game.currentPlayer).toEqual(game.human);
		});

		it('places ships for both players', () => {
			expect(game.human.gameboard.ships.length).toBe(SHIP_SIZES.length);
			expect(game.bot.gameboard.ships.length).toBe(SHIP_SIZES.length);
			expect(game.human.gameboard.ships).not.toEqual(game.bot.gameboard.ships);
		});
	});

	describe('playTurn', () => {
		it('handles a single turn correctly', () => {
			const game = new Game();
			game.initializeGame();
			expect(game.currentPlayer.name).toBe('Unnamed');

			game.playTurn(0, 0);

			expect(game.bot.gameboard.isCellAttacked(0, 0)).toBe(true);
			expect(game.currentPlayer.name).toBe('Bot');
		});
	});

	describe('checkWinner', () => {
		it('declares a winner when all ships are sunk', () => {
			const game = new Game();
			game.initializeGame();

			game.bot.gameboard.ships.forEach(({ ship }) => {
				for (let i = 0; i < ship.size; i++) {
					ship.hit();
				}
			});

			game.checkWinner();

			expect(game.isGameOver).toBe(true);
			expect(game.winner).toBe(game.human);
		});
	});

	describe('update the display each turn', () => {
		const game = new Game();
		game.initializeGame();

		jest.spyOn(game, 'updateUI');
		game.runGame();
		expect(game.updateUI).toHaveBeenCalled();
	});

	describe('runGame', () => {
		it('ends when a player wins', () => {
			const game = new Game();
			game.initializeGame();

			// Mock getUserInput: first try (0, 0), then (1, 1)
			jest
				.spyOn(game, 'getUserInput')
				.mockReturnValueOnce({ row: 0, col: 0 })
				.mockReturnValueOnce({ row: 0, col: 1 })
				.mockReturnValueOnce({ row: 1, col: 0 })
				.mockReturnValueOnce({ row: 1, col: 1 });

			game.runGame();

			expect(game.isGameOver).toBe(true);
			expect(game.winner).toBe(game.human);
		});
	});
});
