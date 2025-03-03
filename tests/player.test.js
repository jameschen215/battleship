import { BOARD_SIZE, SHIP_DIRECTIONS } from '../src/script/constants.js';
import { Gameboard } from '../src/script/gameboard.js';
import { Player, HumanPlayer, ComputerPlayer } from '../src/script/player.js';

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
			const enemyBoard = new Gameboard(10);
			expect(() => player.attack(enemyBoard, 0, 0)).toThrow(
				'attack method must be implemented by subclass'
			);
		});
	});
});

/** ------------------  HumanPlayer test ------------------ */
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
			expect(human.name).toBe('Unnamed');
		});
	});

	describe('has name getter and setter', () => {
		let human;

		beforeEach(() => {
			human = new HumanPlayer();
		});

		afterEach(() => jest.resetAllMocks());

		it('name getter returns a human name', () => {
			expect(human.name).toBe('Unnamed');
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

/** ------------------  ComputerPlayer test ------------------ */
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

		afterEach(() => jest.resetAllMocks());

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
			jest
				.spyOn(Math, 'random')
				.mockReturnValueOnce(0.4)
				.mockReturnValueOnce(0.4);

			const result = bot.attack(enemyBoard);
			expect(result).toEqual({ hit: false, sunk: false });
			// 5 * 0.4 = 2
			expect(enemyBoard.getCellState(2, 2)).toBe('miss');
			expect(enemyBoard.ships[0].ship.getHits()).toBe(0);

			enemyBoard.board.forEach((row, i) => {
				row.forEach((cell, j) => {
					if (i === 2 && j === 2) {
						expect(cell.state).toBe('miss');
					} else {
						expect(cell.state).toBe('empty');
					}
				});
			});
		});

		it('attacks and sinks a ship', () => {
			// Mock coordinates (0,0) and (0,1)
			jest
				.spyOn(Math, 'random')
				.mockReturnValueOnce(0.05) // 0.05 * 5 = 0
				.mockReturnValueOnce(0.05) // 0.05 * 5 = 0
				.mockReturnValueOnce(0.05) // 0.05 * 5 = 0
				.mockReturnValueOnce(0.25); // 0.25 * 5 = 1

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
				.mockReturnValueOnce(0.25)
				.mockReturnValueOnce(0.25);

			const result = bot.attack(enemyBoard);
			expect(result).toEqual({ hit: false, sunk: false });
			expect(enemyBoard.getCellState(1, 1)).toBe('miss');
			expect(enemyBoard.getCellState(0, 0)).toBe('hit');
		});

		it('finds an unattacked cell on a nearly full board', () => {
			// Mark all cells except (4, 4) as attacked
			for (let row = 0; row < BOARD_SIZE; row++) {
				for (let col = 0; col < BOARD_SIZE; col++) {
					if (row !== 4 || col !== 4) {
						enemyBoard.receiveAttack(row, col);
					}
				}
			}

			// Mock Math.random: first try (0, 0), then (4, 4)
			jest
				.spyOn(Math, 'random')
				.mockReturnValueOnce(0.05)
				.mockReturnValueOnce(0.05)
				.mockReturnValueOnce(0.81)
				.mockReturnValueOnce(0.81);

			const result = bot.attack(enemyBoard);
			expect(result).toEqual({ hit: false, sunk: false });

			expect(enemyBoard.getCellState(4, 4)).toBe('miss');
		});
	});
});
