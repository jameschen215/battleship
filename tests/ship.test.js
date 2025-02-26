import { Ship } from '../src/script/ship.js';

describe('Ship', () => {
	it('is a defined class', () => {
		expect(Ship).toBeDefined();
		expect(typeof Ship).toBe('function');
	});

	describe('Ship static properties', () => {
		it('defines MIN_SIZE and MAX_SIZE', () => {
			expect(Ship.MIN_SIZE).toBe(1);
			expect(Ship.MAX_SIZE).toBe(4);
		});
	});

	describe('constructor', () => {
		it('requires exactly one parameter', () => {
			expect(() => new Ship()).toThrow(
				'Ship constructor requires exactly one parameter'
			);
			expect(() => new Ship(2, 3)).toThrow(
				'Ship constructor requires exactly one parameter'
			);
		});

		it('throws errors for invalid size', () => {
			expect(() => new Ship('2')).toThrow(
				'Size must be an integer between 1 and 4'
			);
			expect(() => new Ship(3.5)).toThrow(
				'Size must be an integer between 1 and 4'
			);
			expect(() => new Ship(0)).toThrow(
				'Size must be an integer between 1 and 4'
			);
			expect(() => new Ship(5)).toThrow(
				'Size must be an integer between 1 and 4'
			);
		});

		it('creates a ship with correct size', () => {
			const ship = new Ship(3);

			expect(ship.size).toBe(3);
			expect(typeof ship.hit).toBe('function');
			expect(typeof ship.isSunk).toBe('function');
		});
	});

	describe('hit', () => {
		let ship;

		beforeEach(() => {
			ship = new Ship(3);
		});

		it('increments hits by 1', () => {
			expect(ship.getHits()).toBe(0);
			ship.hit();
			expect(ship.getHits()).toBe(1);
			ship.hit();
			expect(ship.getHits()).toBe(2);
		});

		it('does not affect size', () => {
			ship.hit();
			expect(ship.getHits()).toBe(1);
			expect(ship.size).toBe(3);
		});
	});

	describe('isSunk', () => {
		let ship;

		beforeEach(() => {
			ship = new Ship(3);
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
