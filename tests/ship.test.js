import { Ship } from '../src/script/ship.js';
import { MAX_SHIP_SIZE, MIN_SHIP_SIZE } from '../src/script/constants.js';

describe('Ship', () => {
	describe('constructor', () => {
		it('is a defined class', () => {
			expect(Ship).toBeDefined();
			expect(typeof Ship).toBe('function');
		});

		it('throws errors for invalid size', () => {
			expect(() => new Ship('2')).toThrow(
				`Size must be an integer between ${MIN_SHIP_SIZE} and ${MAX_SHIP_SIZE}`
			);
			expect(() => new Ship(3.5)).toThrow(
				`Size must be an integer between ${MIN_SHIP_SIZE} and ${MAX_SHIP_SIZE}`
			);
			expect(() => new Ship(0)).toThrow(
				`Size must be an integer between ${MIN_SHIP_SIZE} and ${MAX_SHIP_SIZE}`
			);
			expect(() => new Ship(6)).toThrow(
				`Size must be an integer between ${MIN_SHIP_SIZE} and ${MAX_SHIP_SIZE}`
			);
		});

		it('throws errors for invalid direction', () => {
			expect(() => new Ship(3)).toThrow(
				'Directions must be "horizontal" or "vertical"'
			);
			expect(() => new Ship(3, 'diagonal')).toThrow(
				'Directions must be "horizontal" or "vertical"'
			);
		});

		it('creates a ship with correct size and direction', () => {
			const ship = new Ship(3, 'horizontal');

			expect(ship.size).toBe(3);
			expect(ship.direction).toBe('horizontal');
			expect(typeof ship.hit).toBe('function');
			expect(typeof ship.isSunk).toBe('function');
		});
	});

	describe('getters', () => {
		let ship = null;

		beforeEach(() => {
			ship = new Ship(3, 'vertical');
		});

		it("should get a ship's size", () => {
			expect(ship.size).toBe(3);
		});

		it("should get a ship's direction", () => {
			expect(ship.direction).toBe('vertical');
		});

		it("should get a ship's hits", () => {
			expect(ship.hits).toBe(0);
		});
	});

	describe('hit', () => {
		let ship;

		beforeEach(() => {
			ship = new Ship(3, 'horizontal');
		});

		it('increments hits by 1', () => {
			expect(ship.hits).toBe(0);
			ship.hit();
			expect(ship.hits).toBe(1);
			ship.hit();
			expect(ship.hits).toBe(2);
		});

		it('does not affect size', () => {
			ship.hit();
			expect(ship.hits).toBe(1);
			expect(ship.size).toBe(3);
		});
	});

	describe('isSunk', () => {
		let ship;

		beforeEach(() => {
			ship = new Ship(3, 'horizontal');
		});

		it('returns false when hits are less than size', () => {
			expect(ship.isSunk()).toBe(false);
			ship.hit();
			expect(ship.isSunk()).toBe(false);
		});

		it('returns true when hits equal or exceed size', () => {
			ship.hit();
			ship.hit();
			ship.hit();
			expect(ship.isSunk()).toBe(true);
		});
	});
});
