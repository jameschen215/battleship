import {
	getBufferZone,
	getSunkShipsBufferZone,
} from '../src/script/helpers.js';

describe('getBufferZone', () => {
	it('exists', () => {
		expect(getBufferZone).toBeDefined();
		expect(typeof getBufferZone).toBe('function');
	});

	it('should return correct result', () => {
		const sunk = {
			size: 2,
			direction: 'horizontal',
			positions: [
				[0, 0],
				[0, 1],
			],
		};

		const expectedResult = [
			[0, 2],
			[1, 0],
			[1, 1],
			[1, 2],
		];

		const result = getBufferZone(sunk.positions, sunk.size, sunk.direction);
		expect(result).toEqual(expectedResult);
	});
});

describe('getSunkShipsBufferZone', () => {
	it('exists', () => {
		expect(getSunkShipsBufferZone).toBeDefined();
		expect(typeof getSunkShipsBufferZone).toBe('function');
	});

	it('should return correct result', () => {
		const sunkShips = [
			{
				size: 2,
				direction: 'horizontal',
				positions: [
					[0, 0],
					[0, 1],
				],
			},
		];

		const expectedResult = new Set(
			[
				[0, 2],
				[1, 0],
				[1, 1],
				[1, 2],
			].map(JSON.stringify)
		);

		const result = getSunkShipsBufferZone(sunkShips);
		expect(result).toEqual(expectedResult);
	});
});
