import { createShip } from '../src/script/ship.js';

describe('createShip', () => {
	// Test 1: Check if createShip exists and is a function
	it('should exist and be a function', () => {
		expect(createShip).toBeDefined();
		expect(typeof createShip).toBe('function');
	});

	// Test 2: Check if the function has only one parameter
	it('should require only one parameter', () => {
		expect(() => createShip()).toThrow(
			'This function requires only one parameter - no more, no fewer.'
		);
		expect(() => createShip(3, 5)).toThrow(
			'This function requires only one parameter - no more, no fewer.'
		);
	});

	// Test 3: Check if size is an integer between 2 and 5, inclusive.
	it('should throw an error when size is not an integer or size is out of the range.', () => {
		expect(() => createShip('3')).toThrow(
			'Size should be an integer and between 2 and 5, inclusive.'
		);
		expect(() => createShip(3.5)).toThrow(
			'Size should be an integer and between 2 and 5, inclusive.'
		);
		expect(() => createShip(7)).toThrow(
			'Size should be an integer and between 2 and 5, inclusive.'
		);
		expect(() => createShip(-3)).toThrow(
			'Size should be an integer and between 2 and 5, inclusive.'
		);
	});

	// Test 4: Test if it returns a ship object with expected properties
	it('should return a ship object with correct properties', () => {
		const ship = createShip(3);

		expect(ship).toBeDefined();
		expect(ship).toBeInstanceOf(Object);
		expect(ship.size).toBe(3);
		expect(ship.hits).toBe(0);
		expect(typeof ship.hit).toBe('function');
		expect(typeof ship.isSunk).toBe('function');
	});
});
