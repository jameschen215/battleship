import { Gameboard } from '../src/script/gameboard.js';
import { Player, HumanPlayer, ComputerPlayer } from '../src/script/player.js';

describe('Player', () => {
	describe('existence', () => {
		it('is a defined class', () => {
			expect(Player).toBeDefined();
			expect(typeof Player).toBe('function');
		});
	});

	describe('constructor', () => {
		let player;

		beforeEach(() => {
			player = new Player();
		});

		it('initializes with a Gameboard instance', () => {
			expect(player.gameboard).toBeInstanceOf(Gameboard);
			expect(player.gameboard.board.length).toBe(10);
		});

		it('throws error when attack is called directly', () => {
			const enemyBoard = new Gameboard();

			expect(() => player.attack(enemyBoard, 0, 0)).toThrow(
				'attack method must be implemented by subclass'
			);
		});
	});
});

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
			const human1 = new HumanPlayer();
			const human2 = new HumanPlayer('Tom');

			expect(human1.name).toBe('Unnamed');
			expect(human2.name).toBe('Tom');
		});
	});

	describe('attack', () => {
		let human;
		let enemyBoard;

		beforeEach(() => {
			human = new HumanPlayer('Jerry');
			enemyBoard = new Gameboard();
		});

		it('should attack on an enemy board', () => {
			expect(() => human.attack()).toThrow(
				'Must attack an enemy Gameboard instance'
			);

			expect(() => human.attack('board', 0, 0)).toThrow(
				'Must attack an enemy Gameboard instance'
			);
		});

		it('attacks specified coordinates and returns result', () => {
			enemyBoard.placeShip(3, 0, 0);

			const result1 = human.attack(enemyBoard, 0, 0);
			expect(result1).toEqual({ hit: true, sunk: false });
			expect(enemyBoard.getCellState(0, 0)).toBe('hit');

			const result2 = human.attack(enemyBoard, 1, 0);
			expect(result2).toEqual({ hit: false, sunk: false });
			expect(enemyBoard.getCellState(1, 0)).toBe('miss');
		});

		it('attacks and sinks a ship', () => {
			enemyBoard.placeShip(2, 0, 0);
			human.attack(enemyBoard, 0, 0);
			const result = human.attack(enemyBoard, 0, 1);

			expect(result).toEqual({ hit: true, sunk: true });
			expect(enemyBoard.getCellState(0, 1)).toBe('hit');
		});
	});
});

describe('ComputerPlayer', () => {
	describe('existence', () => {
		it('is a defined class extended from Player', () => {
			const computerPlayer = new ComputerPlayer();
			expect(computerPlayer).toBeInstanceOf(ComputerPlayer);
			expect(computerPlayer).toBeInstanceOf(Player);
		});
	});

	describe('constructor', () => {
		it('initializes with a player name', () => {
			const bot = new ComputerPlayer();

			expect(bot.name).toBe('Bot');
		});
	});

	describe('attack', () => {
		let bot;
		let enemyBoard;

		beforeEach(() => {
			bot = new ComputerPlayer();
			enemyBoard = new Gameboard();
			enemyBoard.placeShip(2, 0, 0);
		});

		afterEach(() => {
			// Clean up mocks after each test
			jest.restoreAllMocks();
		});

		it('should attack on an enemy board', () => {
			expect(() => bot.attack()).toThrow(
				'Must attack an enemy Gameboard instance'
			);

			expect(() => bot.attack('board', 0, 0)).toThrow(
				'Must attack an enemy Gameboard instance'
			);
		});

		it('attacks a random unattacked cell and hits a ship', () => {
			// Mock Math.random to return 0.05, 0.05 -> (0, 0)
			jest.spyOn(Math, 'random').mockReturnValue(0.05);

			const result = bot.attack(enemyBoard);
			expect(result).toEqual({ hit: true, sunk: false });
			expect(enemyBoard.getCellState(0, 0)).toBe('hit');
		});

		it('attacks an empty unattacked cell and misses', () => {
			// Mock Math.random to return 0.55, 0.55 -> (5, 5)
			jest.spyOn(Math, 'random').mockReturnValue(0.55);

			const result = bot.attack(enemyBoard);
			expect(result).toEqual({ hit: false, sunk: false });
			expect(enemyBoard.getCellState(5, 5)).toBe('miss');
			expect(enemyBoard.ships[0].ship.getHits()).toBe(0);

			enemyBoard.board.forEach((row, i) => {
				row.forEach((cell, j) => {
					if (i === 5 && j === 5) {
						expect(cell.state).toBe('miss');
					} else {
						expect(cell.state).toBe('empty');
					}
				});
			});
		});

		it('attacks and sinks a ship', () => {
			jest
				.spyOn(Math, 'random')
				.mockReturnValueOnce(0.05)
				.mockReturnValueOnce(0.05)
				.mockReturnValueOnce(0.05)
				.mockReturnValueOnce(0.15);

			bot.attack(enemyBoard);
			const result = bot.attack(enemyBoard);
			expect(result).toEqual({ hit: true, sunk: true });
		});

		it('avoids attacking an already attacked cell', () => {
			enemyBoard.receiveAttack(0, 0);

			// Mock Math.random: first try (0, 0), then (1, 1)
			jest
				.spyOn(Math, 'random')
				.mockReturnValueOnce(0.05)
				.mockReturnValueOnce(0.05)
				.mockReturnValueOnce(0.15)
				.mockReturnValueOnce(0.15);

			const result = bot.attack(enemyBoard);
			expect(result).toEqual({ hit: false, sunk: false });
			expect(enemyBoard.getCellState(1, 1)).toBe('miss');
			expect(enemyBoard.getCellState(0, 0)).toBe('hit');
		});

		it('finds an unattacked cell on a nearly full board', () => {
			// Mark all cells except (9, 9) as attacked
			for (let row = 0; row < Gameboard.BOARD_SIZE; row++) {
				for (let col = 0; col < Gameboard.BOARD_SIZE; col++) {
					if (row !== 9 || col !== 9) {
						enemyBoard.receiveAttack(row, col);
					}
				}
			}

			// Mock Math.random: first try (0, 0), then (9, 9)
			jest
				.spyOn(Math, 'random')
				.mockReturnValueOnce(0.05)
				.mockReturnValueOnce(0.05)
				.mockReturnValueOnce(0.95)
				.mockReturnValueOnce(0.95);

			const result = bot.attack(enemyBoard);
			expect(result).toEqual({ hit: false, sunk: false });
			expect(enemyBoard.getCellState(9, 9)).toBe('miss');
		});
	});
});
