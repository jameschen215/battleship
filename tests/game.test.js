import * as utils from '../src/script/utils.js';
import * as helpers from '../src/script/helpers.js';
import * as displayModule from '../src/script/display.js';

import { Game } from '../src/script/game.js';
import { Gameboard } from '../src/script/gameboard.js';
import { HumanPlayer } from '../src/script/human-player.js';
import { EasyComputerPlayer } from '../src/script/computer-players/easy-computer-player.js';
import { NormalComputerPlayer } from '../src/script/computer-players/normal-computer-player.js';
import { HardComputerPlayer } from '../src/script/computer-players/hard-computer-player.js';

// Mock dependencies
jest.mock('../src/script/gameboard.js'); // Mock Gameboard class

jest.mock('../src/script/utils.js', () => ({
	getRandomInt: jest.fn(),
}));

jest.mock('../src/script/helpers.js', () => ({
	isCoordinateOnBoard: jest.fn(),
}));

jest.mock('../src/script/display.js', () => ({
	display: jest.fn(),
}));

describe('Game', () => {
	let game;

	beforeEach(() => {
		jest.clearAllMocks();

		// Mock Gameboard implementation
		Gameboard.mockImplementation(() => ({
			setBoard: jest.fn(),
			placeShip: jest.fn().mockReturnValue({ success: true }),
			allSunk: jest.fn(),
		}));

		// Mock human player placeShips
		jest
			.spyOn(HumanPlayer.prototype, 'placeShips')
			.mockImplementation(() => {});

		// Mock human player name getter
		Object.defineProperty(HumanPlayer.prototype, 'name', {
			get: jest.fn(() => 'Human'),
			configurable: true,
		});

		// Mock normal computer player's placeShips method
		jest
			.spyOn(NormalComputerPlayer.prototype, 'placeShips')
			.mockImplementation(() => {});

		// Mock normal computer player's attack method
		jest
			.spyOn(NormalComputerPlayer.prototype, 'attack')
			.mockImplementation(() => ({
				row: 0,
				col: 0,
				result: { hit: false, sunk: false },
			}));

		// Mock normal computer player's resetHistory method
		jest
			.spyOn(NormalComputerPlayer.prototype, 'resetHistory')
			.mockImplementation(() => {});

		// Mock hard computer player's placeShips method
		jest
			.spyOn(HardComputerPlayer.prototype, 'placeShips')
			.mockImplementation(() => {});

		// Mock utilities
		utils.getRandomInt.mockImplementation((min, max) => min);
		helpers.isCoordinateOnBoard.mockReturnValue(true);
		displayModule.display.mockImplementation(() => {});

		game = new Game();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('constructor', () => {
		it('initializes with a human and normal computer player', () => {
			expect(game.human).toBeInstanceOf(HumanPlayer);
			expect(game.bot).toBeInstanceOf(NormalComputerPlayer);
			expect(game.handleClickOnCell).toBeDefined();
			expect(game.updateUI).toBeDefined();
		});
	});

	describe('initializeGame', () => {
		it('sets up boards, places ships, and initializes game state', () => {
			game.initializeGame();

			expect(game.human.gameboard.setBoard).toHaveBeenCalled();
			expect(game.bot.gameboard.setBoard).toHaveBeenCalled();
			expect(game.human.placeShips).toHaveBeenCalled();
			expect(game.bot.placeShips).toHaveBeenCalled();
			expect(game.bot.resetHistory).toHaveBeenCalled();

			expect(game.currentPlayer).toBe(game.human);
			expect(game.isGameOver).toBe(false);
			expect(game.winner).toBe(null);
			expect(game.isGameRunning).toBe(false);
		});
	});

	describe('setDifficulty', () => {
		it('sets bot to EasyComputerPlayer for "easy"', () => {
			game.setDifficulty('easy');
			expect(game.bot).toBeInstanceOf(EasyComputerPlayer);
			expect(game.bot.name).toBe('Bot');
		});

		it('sets bot to NormalComputerPlayer for "normal"', () => {
			game.setDifficulty('normal');
			expect(game.bot).toBeInstanceOf(NormalComputerPlayer);
			expect(game.bot.name).toBe('Bot');
		});

		it('sets bot to HardComputerPlayer for "hard"', () => {
			game.setDifficulty('hard');
			expect(game.bot).toBeInstanceOf(HardComputerPlayer);
			expect(game.bot.name).toBe('Bot');
		});

		it('defaults to NormalComputerPlayer for invalid input', () => {
			game.setDifficulty('invalid');
			expect(game.bot).toBeInstanceOf(NormalComputerPlayer);
			expect(game.bot.name).toBe('Bot');
		});
	});

	describe('updateUI', () => {
		it('calls display with the game instance', () => {
			game.updateUI();
			expect(displayModule.display).toHaveBeenCalledWith(game);
			expect(displayModule.display).toHaveBeenCalledTimes(1);
		});
	});

	describe('handleClickOnCell', () => {
		it('resolves user input promise with coordinates and resets resolver', async () => {
			game.initializeGame();
			game.currentPlayer = game.human;

			// Spy on HumanPlayer methods
			jest
				.spyOn(HumanPlayer.prototype, 'attack')
				.mockReturnValueOnce({ result: { hit: true } })
				.mockReturnValueOnce({ result: { hit: true } });

			// Mock win condition after one turn
			game.bot.gameboard.allSunk
				.mockReturnValueOnce(false) // Initial check
				.mockReturnValueOnce(true); // After human turn

			// Make sure human.gameboard.allSunk returns false to prevent bot win
			game.human.gameboard.allSunk.mockReturnValue(false);

			// Start the game
			const gamePromise = game.runGame();

			// Ensure coordinateResolve is set by first click
			await new Promise((resolve) => setTimeout(resolve, 50));

			// Simulate a click
			game.handleClickOnCell(2, 3);

			// Ensure coordinateResolve is set by second click in a row
			await new Promise((resolve) => setTimeout(resolve, 50));
			game.handleClickOnCell(2, 4);

			// Wait for the game to complete
			await gamePromise;

			expect(game.human.attack).toHaveBeenCalledWith(game.bot.gameboard, 2, 3);
			expect(game.coordinateResolve).toBe(null);
			expect(game.isGameOver).toBe(true);
		});

		it('does nothing if no resolver is set', () => {
			game.initializeGame();
			game.coordinateResolve = null;
			expect(() => game.handleClickOnCell(1, 1)).not.toThrow();
		});
	});

	describe('runGame', () => {
		/**
		 * 1. Explicitly initialize all required state;
		 * 2. Make sure the test environment matches the actual application flow;
		 * 3. Add diagnostic logs to understand the state at different points;
		 * 4. Consider using more flexible timing mechanisms when dealing with
		 * 		asynchronous code.
		 */
		it('runs until human wins after two turns', async () => {
			// Explicitly initialize the game
			game.initializeGame();

			// Ensure the human is the current player
			game.currentPlayer = game.human;

			// Spy on HumanPlayer methods
			jest
				.spyOn(HumanPlayer.prototype, 'attack')
				.mockReturnValueOnce({ result: { hit: true } })
				.mockReturnValueOnce({ result: { hit: false } })
				.mockReturnValueOnce({ result: { hit: true } });

			// Setup mock return values
			game.bot.gameboard.allSunk
				.mockReturnValueOnce(false)
				.mockReturnValueOnce(false)
				.mockReturnValueOnce(false)
				.mockReturnValueOnce(true);
			game.human.gameboard.allSunk.mockReturnValue(false);

			// Start the game
			const runPromise = game.runGame();

			// Give the game a moment to start and set up coordinateResolve
			await new Promise((resolve) => setTimeout(resolve, 100));

			// First attack
			game.handleClickOnCell(2, 3);

			// Wait a bit
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Second attack
			game.handleClickOnCell(2, 4);

			// Wait for the game to complete or timeout after 2 seconds
			await Promise.race([
				runPromise,
				new Promise((resolve) =>
					setTimeout(() => {
						console.log('Game timed out. Current state:', {
							currentPlayer:
								game.currentPlayer === game.human ? 'Human' : 'Bot',
							isGameRunning: game.isGameRunning,
							isGameOver: game.isGameOver,
						});
						resolve();
					}, 2000)
				),
			]);

			// Check if the game ended as expected
			expect(game.human.attack).toHaveBeenCalledWith(game.bot.gameboard, 2, 3);
			expect(game.human.attack).toHaveBeenCalledWith(game.bot.gameboard, 2, 4);
			expect(game.bot.attack).toHaveBeenCalled();
		}, 10000);
	});

	describe('game mechanics', () => {
		// Set timeout for all tests in this block
		jest.setTimeout(10000);

		it('correctly updates game state after a full turn cycle', async () => {
			game.initializeGame();
			expect(game.currentPlayer).toBe(game.human);

			jest
				.spyOn(HumanPlayer.prototype, 'attack')
				.mockReturnValueOnce({ result: { hit: false } })
				.mockReturnValueOnce({ result: { hit: false } });

			// Setup mock returns
			game.bot.gameboard.allSunk.mockReturnValue(false);
			game.human.gameboard.allSunk.mockReturnValue(false);

			// Make bot's delay very short
			utils.getRandomInt.mockReturnValue(10); // Just 10ms delay

			// Run one full turn cycle
			const runPromise = game.runGame();
			await new Promise((resolve) => setTimeout(resolve, 50));
			game.handleClickOnCell(2, 3);

			// Wait a bit for bot's turn to complete
			await new Promise((resolve) => setTimeout(resolve, 50));

			// End the game to prevent hanging
			game.isGameOver = true;

			await Promise.race([
				runPromise,
				new Promise((resolve) =>
					setTimeout(() => {
						console.log('Game timed out. Current state:', {
							currentPlayer:
								game.currentPlayer === game.human ? 'Human' : 'Bot',
							isGameRunning: game.isGameRunning,
							isGameOver: game.isGameOver,
						});
						resolve();
					}, 200)
				),
			]);

			// Verify human player attacked bot's board
			expect(game.human.attack).toHaveBeenCalledWith(game.bot.gameboard, 2, 3);
			// Verify bot player attacked human's board
			expect(game.bot.attack).toHaveBeenCalled();
		});

		it('ends game when human wins', async () => {
			game.initializeGame();

			jest
				.spyOn(HumanPlayer.prototype, 'attack')
				.mockReturnValueOnce({ result: { hit: true } })
				.mockReturnValueOnce({ result: { hit: true } });

			// Setup for human win
			game.bot.gameboard.allSunk
				.mockReturnValueOnce(false)
				.mockReturnValueOnce(true);
			game.human.gameboard.allSunk.mockReturnValue(false);

			const runPromise = game.runGame();

			await new Promise((resolve) => setTimeout(resolve, 100));
			game.handleClickOnCell(2, 3);

			await new Promise((resolve) => setTimeout(resolve, 100));
			game.handleClickOnCell(2, 4);
			// await runPromise;
			await Promise.race([
				runPromise,
				new Promise((resolve) =>
					setTimeout(() => {
						console.log('Game timed out. Current state:', {
							currentPlayer:
								game.currentPlayer === game.human ? 'Human' : 'Bot',
							isGameRunning: game.isGameRunning,
							isGameOver: game.isGameOver,
						});
						resolve();
					}, 200)
				),
			]);

			expect(game.isGameOver).toBe(true);
			expect(game.winner).toBe(game.human);
			expect(displayModule.display).toHaveBeenCalled();
		});

		it('ends game when bot wins', async () => {
			game.initializeGame();

			jest
				.spyOn(HumanPlayer.prototype, 'attack')
				.mockReturnValueOnce({ result: { hit: false } })
				.mockReturnValueOnce({ result: { hit: false } });

			// Setup for bot win
			game.bot.gameboard.allSunk.mockReturnValue(false);
			game.human.gameboard.allSunk
				.mockReturnValueOnce(false)
				.mockReturnValueOnce(true);

			const runPromise = game.runGame();
			await new Promise((resolve) => setTimeout(resolve, 100));
			game.handleClickOnCell(2, 3);

			await new Promise((resolve) => setTimeout(resolve, 100));
			game.handleClickOnCell(2, 8);

			await Promise.race([
				runPromise,
				new Promise((resolve) =>
					setTimeout(() => {
						console.log('Game timed out. Current state:', {
							currentPlayer:
								game.currentPlayer === game.human ? 'Human' : 'Bot',
							isGameRunning: game.isGameRunning,
							isGameOver: game.isGameOver,
						});
						resolve();
					}, 200)
				),
			]);

			expect(game.isGameOver).toBe(true);
			expect(game.winner).toBe(game.bot);
		});

		it('ignores invalid coordinates', async () => {
			game.initializeGame();
			helpers.isCoordinateOnBoard.mockReturnValue(false);

			const attackSpy = jest.spyOn(game.human, 'attack');

			const runPromise = game.runGame();
			await new Promise((resolve) => setTimeout(resolve, 100));
			game.handleClickOnCell(20, 30);

			// End game to prevent hanging
			game.isGameOver = true;

			await Promise.race([
				runPromise,
				new Promise((resolve) =>
					setTimeout(() => {
						console.log('Game timed out. Current state:', {
							currentPlayer:
								game.currentPlayer === game.human ? 'Human' : 'Bot',
							isGameRunning: game.isGameRunning,
							isGameOver: game.isGameOver,
						});
						resolve();
					}, 200)
				),
			]);

			expect(attackSpy).not.toHaveBeenCalled();
		});

		it('correctly sets up different computer players based on difficulty', () => {
			// Easy
			game.setDifficulty('easy');
			expect(game.bot).toBeInstanceOf(EasyComputerPlayer);

			// Verify specific behavior if needed
			const easyBot = game.bot;
			game.initializeGame();

			// Normal
			game.setDifficulty('normal');
			expect(game.bot).toBeInstanceOf(NormalComputerPlayer);
			expect(game.bot).not.toBe(easyBot);

			// Hard
			game.setDifficulty('hard');
			expect(game.bot).toBeInstanceOf(HardComputerPlayer);
		});

		it('updates UI after state changes', async () => {
			game.initializeGame();
			displayModule.display.mockClear();

			game.bot.gameboard.allSunk.mockReturnValue(false);
			game.human.gameboard.allSunk.mockReturnValue(false);

			const runPromise = game.runGame();
			await new Promise((resolve) => setTimeout(resolve, 100));
			game.handleClickOnCell(2, 3);

			// End game to prevent hanging
			game.isGameOver = true;

			// await runPromise;
			await Promise.race([
				runPromise,
				new Promise((resolve) =>
					setTimeout(() => {
						console.log('Game timed out. Current state:', {
							currentPlayer:
								game.currentPlayer === game.human ? 'Human' : 'Bot',
							isGameRunning: game.isGameRunning,
							isGameOver: game.isGameOver,
						});
						resolve();
					}, 200)
				),
			]);

			expect(displayModule.display).toHaveBeenCalledWith(game);
			// Should have been called at least once during the game cycle
			expect(displayModule.display.mock.calls.length).toBeGreaterThan(0);
		});
	});
});
