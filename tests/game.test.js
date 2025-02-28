import { BOARD_SIZE, SHIP_SIZES } from '../src/script/constants.js';
import { Game } from '../src/script/game.js';
import { Gameboard } from '../src/script/gameboard.js';
import { HumanPlayer, ComputerPlayer } from '../src/script/player.js';

// jest.mock('../src/script/constants.js', () => ({
// 	BOARD_SIZE: 2,
// 	SHIP_SIZES: [2, 2],
// }));

describe('Game', () => {
	describe('constructor', () => {
		let game;

		beforeEach(() => {
			game = new Game();
		});

		it('is a defined class', () => {
			expect(Game).toBeDefined();
			expect(typeof Game).toBe('function');
		});

		it('creates a human player with a correctly initialized gameboard ', () => {
			expect(game.human).toBeInstanceOf(HumanPlayer);

			expect(game.human.gameboard).toBeInstanceOf(Gameboard);

			game.human.gameboard.board.flat().forEach((cell) => {
				expect(cell.state).toBe('empty');
			});
		});

		it('creates a computer player with a correctly initialized gameboard', () => {
			expect(game.bot).toBeInstanceOf(ComputerPlayer);
			expect(game.bot.gameboard).toBeInstanceOf(Gameboard);
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

		it('initializes isGameOver to "false"', () => {
			expect(game.isGameOver).toBe(false);
		});

		it('initializes winner to "null"', () => {
			expect(game.winner).toBe(null);
		});

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
		let game;

		beforeEach(() => {
			game = new Game();
		});

		it('handles a human turn correctly', () => {
			game.isGameOver = false;
			game.winner = null;
			game.currentPlayer = game.human;
			game.bot.gameboard.placeShip(2, 0, 0, 'horizontal');

			expect(game.currentPlayer.name).toBe('Unnamed');

			const result = game.playTurn(0, 0);

			expect(result.hit).toBe(true);
			expect(game.currentPlayer.name).not.toBe('Unnamed');
		});
	});

	describe('checkWinner', () => {
		let game;

		beforeEach(() => {
			game = new Game();
		});

		it('declares a winner when all ships are sunk', () => {
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

		it('goes on when ships are hit but not sunk', () => {
			game.bot.gameboard.placeShip(2, 0, 0);
			game.playTurn(0, 0);
			game.checkWinner();

			expect(game.winner).toBe(null);
			expect(game.isGameOver).toBe(false);
		});

		it('goes on when not all ships are hit and sunk', () => {
			game.currentPlayer = game.human;
			game.winner = null;
			game.isGameOver = false;
			game.human.gameboard.placeShip(2, 0, 0);
			game.bot.gameboard.placeShip(2, 0, 0);
			game.bot.gameboard.placeShip(2, 1, 0);

			game.playTurn(0, 0);
			game.playTurn(0, 0);
			const result = game.playTurn(0, 1);
			game.checkWinner();

			expect(result.sunk).toBe(true);
			expect(game.winner).toBe(null);
			expect(game.isGameOver).toBe(false);
		});
	});

	describe('runGame', () => {
		let game;

		beforeEach(() => {
			game = new Game();
			// Manually place ships for predictable testing

			game.human.gameboard.placeShip(1, 0, 0, 'horizontal'); // Human's ship at (0, 0)
			game.bot.gameboard.placeShip(1, 1, 1, 'horizontal'); // Bot's ship at (1, 1)
			game.currentPlayer = game.human; // Start with human's turn
			game.isGameOver = false;
			game.winner = null;
		});

		// afterEach(() => jest.resetAllMocks());

		it('updates after human turn: hit and switch to bot', () => {
			// Simulate human attacking (1, 1) - hits bot's ship
			game.playTurn(1, 1);

			// Check bot's board: (1, 1) should be 'hit'
			expect(game.bot.gameboard.getCellState(1, 1)).toBe('hit');
			// Check human's board: unchanged
			expect(game.human.gameboard.getCellState(0, 0)).toBe('empty');
			// Check turn: now bot's turn
			expect(game.currentPlayer).toBe(game.bot);
			// Check game not over
			expect(game.isGameOver).toBe(false);
		});

		it('updates after bot turn: hit and switch back to human', () => {
			// First, human attacks (1, 1) to switch to bot
			game.playTurn(1, 1);
			// Mock bot's attack to hit (0, 0)
			jest.spyOn(game.bot, 'attack').mockImplementation(() => {
				game.human.gameboard.receiveAttack(0, 0);
				return { hit: true, sunk: true };
			});

			// Simulate bot's turn (no coordinates needed due to mock)
			game.playTurn();

			// Check human's board: (0, 0) should be 'hit'
			expect(game.human.gameboard.getCellState(0, 0)).toBe('hit');
			// Check bot's board: (1, 1) still 'hit'
			expect(game.bot.gameboard.getCellState(1, 1)).toBe('hit');
			// Check turn: back to human
			expect(game.currentPlayer).toBe(game.human);
			// Check game not over yet
			expect(game.isGameOver).toBe(false);
		});

		it('ends game correctly when all ships are sunk', () => {
			// Human attacks (1, 1) - sinks bot's only ship
			game.playTurn(1, 1);
			game.checkWinner();
			expect(game.isGameOver).toBe(true);
			expect(game.winner).toBe(game.human);
		});

		it('update the display each turn', () => {
			jest.spyOn(game, 'updateUI');
			game.runGame();
			expect(game.updateUI).toHaveBeenCalled();
		});
	});
});
