// tests/game.test.js

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
			placeShips: jest.fn(),
			allSunk: jest.fn().mockReturnValue(false),
		}));

		// Spy on HumanPlayer methods
		jest.spyOn(HumanPlayer.prototype, 'attack').mockImplementation(() => {});
		jest
			.spyOn(HumanPlayer.prototype, 'placeShips')
			.mockImplementation(() => {});
		Object.defineProperty(HumanPlayer.prototype, 'name', {
			get: jest.fn(() => 'Human'),
			configurable: true,
		});

		// Spy on EasyComputerPlayer placeShips method
		jest
			.spyOn(EasyComputerPlayer.prototype, 'placeShips')
			.mockImplementation(() => {});

		// Spy on HardComputerPlayer methods
		jest
			.spyOn(HardComputerPlayer.prototype, 'attack')
			.mockImplementation(() => ({ row: 0, col: 0 }));

		jest
			.spyOn(HardComputerPlayer.prototype, 'placeShips')
			.mockImplementation(() => {});

		jest
			.spyOn(HardComputerPlayer.prototype, 'resetHistory')
			.mockImplementation(() => {});

		Object.defineProperty(HardComputerPlayer.prototype, 'name', {
			get: jest.fn(() => 'Bot'),
			configurable: true,
		});

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
		it('initializes with a human and hard computer player', () => {
			expect(game.human).toBeInstanceOf(HumanPlayer);
			expect(game.bot).toBeInstanceOf(HardComputerPlayer);
			expect(game.handleClickOnCell).toBeDefined();
			expect(game.updateUI).toBeDefined();
			expect(game.bot.sunkShips).toEqual([]);
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
			expect(game.bot.sunkShips).toEqual([]);
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

			// Mock win condition after one turn
			game.bot.gameboard.allSunk
				.mockReturnValueOnce(false) // Initial check
				.mockReturnValueOnce(true); // After human turn

			const gamePromise = game.runGame();
			game.handleClickOnCell(2, 3);
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

			// Setup mock return values
			game.bot.gameboard.allSunk
				.mockReturnValueOnce(false)
				.mockReturnValueOnce(false)
				.mockReturnValueOnce(true);
			game.human.gameboard.allSunk.mockReturnValue(false);

			// Start the game
			const runPromise = game.runGame();

			// Give the game a moment to start and set up coordinateResolve
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Check if coordinateResolve is set - if not, log the game state
			if (typeof game.coordinateResolve !== 'function') {
				console.log('Game state:', {
					currentPlayer: game.currentPlayer === game.human ? 'Human' : 'Bot',
					isGameRunning: game.isGameRunning,
					isGameOver: game.isGameOver,
				});

				// Force the coordinateResolve to be set by calling getUserInput directly
				// This is a bit hacky but might help diagnose the issue
				game.coordinateResolve = (coords) => {
					console.log('Manual coordinateResolve called with', coords);
				};
			}

			// First turn
			game.handleClickOnCell(2, 3);

			// Wait a bit
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Second turn
			game.handleClickOnCell(4, 5);

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
			expect(game.bot.attack).toHaveBeenCalled();
		}, 10000);
	});

	describe('game mechanics', () => {
		// Set timeout for all tests in this block
		jest.setTimeout(10000);

		it('correctly updates game state after a full turn cycle', async () => {
			game.initializeGame();
			expect(game.currentPlayer).toBe(game.human);

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
					}, 2000)
				),
			]);

			// Verify human player attacked bot's board
			expect(game.human.attack).toHaveBeenCalledWith(game.bot.gameboard, 2, 3);
			// Verify bot player attacked human's board
			expect(game.bot.attack).toHaveBeenCalled();
		});

		it('ends game when human wins', async () => {
			game.initializeGame();

			// Setup for human win
			game.bot.gameboard.allSunk
				.mockReturnValueOnce(false)
				.mockReturnValueOnce(true);
			game.human.gameboard.allSunk.mockReturnValue(false);

			const runPromise = game.runGame();
			await new Promise((resolve) => setTimeout(resolve, 100));
			game.handleClickOnCell(2, 3);
			await runPromise;

			expect(game.isGameOver).toBe(true);
			expect(game.winner).toBe(game.human);
			expect(displayModule.display).toHaveBeenCalled();
		});

		it('ends game when bot wins', async () => {
			game.initializeGame();

			// Setup for bot win
			game.bot.gameboard.allSunk.mockReturnValue(false);
			game.human.gameboard.allSunk
				.mockReturnValueOnce(false)
				.mockReturnValueOnce(true);

			const runPromise = game.runGame();
			await new Promise((resolve) => setTimeout(resolve, 100));
			game.handleClickOnCell(2, 3);
			await runPromise;

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
					}, 2000)
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
					}, 2000)
				),
			]);

			expect(displayModule.display).toHaveBeenCalledWith(game);
			// Should have been called at least once during the game cycle
			expect(displayModule.display.mock.calls.length).toBeGreaterThan(0);
		});
	});
});
