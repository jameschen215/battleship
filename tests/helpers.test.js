import {
	getSurroundingHorizontally,
	getSurroundingVertically,
	groupCoordinates,
	groupedSurroundingCoordinates,
} from '../src/script/helpers.js';

describe('helpers', () => {
	describe('getSurroundingHorizontally', () => {
		it('should exist', () => {
			expect(getSurroundingHorizontally).toBeDefined();
			expect(typeof getSurroundingHorizontally).toBe('function');
		});

		describe('should return an array contains the given coord and its horizontal neighbors', () => {
			it('return correct array when coord is at center', () => {
				const result = getSurroundingHorizontally(2, 7, 2);
				const expected = [
					[2, 6],
					[2, 7],
					[2, 8],
				];

				expect(result).toEqual(expected);
			});

			it('return correct array when coord is at bottom left corner', () => {
				const result = getSurroundingHorizontally(9, 0, 5);
				const expected = [
					[9, 0],
					[9, 1],
					[9, 2],
					[9, 3],
					[9, 4],
				];

				expect(result).toEqual(expected);
			});

			it('return correct array when coord is at top right corner', () => {
				const result = getSurroundingHorizontally(0, 9, 4);
				const expected = [
					[0, 6],
					[0, 7],
					[0, 8],
					[0, 9],
				];

				expect(result).toEqual(expected);
			});
		});
	});

	describe('getSurroundingVertically', () => {
		it('should exist', () => {
			expect(getSurroundingVertically).toBeDefined();
			expect(typeof getSurroundingVertically).toBe('function');
		});

		it('return correct array when coord is at center', () => {
			const result = getSurroundingVertically(4, 4, 5);
			const expected = [
				[0, 4],
				[1, 4],
				[2, 4],
				[3, 4],
				[4, 4],
				[5, 4],
				[6, 4],
				[7, 4],
				[8, 4],
			];

			expect(result).toEqual(expected);
		});

		it('return correct array when coord is at bottom right corner', () => {
			const result = getSurroundingVertically(9, 9, 3);
			const expected = [
				[7, 9],
				[8, 9],
				[9, 9],
			];

			expect(result).toEqual(expected);
		});

		it('return correct array when coord is at top left corner', () => {
			const result = getSurroundingVertically(0, 0, 4);
			const expected = [
				[0, 0],
				[1, 0],
				[2, 0],
				[3, 0],
			];

			expect(result).toEqual(expected);
		});
	});

	describe('groupCoordinates', () => {
		it('should exist', () => {
			expect(groupCoordinates).toBeDefined();
			expect(typeof groupCoordinates).toBe('function');
		});

		it('should throw error when groupSize is greater than coordinates length', () => {
			const arr = [1, 2, 3, 4];
			const groupSize = 5;

			expect(() => groupCoordinates(arr, groupSize)).toThrow(
				"Group size must be smaller than the coordinates' length"
			);
		});

		it('should throw error when groupSize is smaller than one', () => {
			const arr = [1, 2, 3, 4];
			const groupSize = 1;

			expect(() => groupCoordinates(arr, groupSize)).toThrow(
				'Group size must be greater than one'
			);
		});

		it('should group an array correctly', () => {
			const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
			const groupSize = 3;
			const expected = [
				[1, 2, 3],
				[2, 3, 4],
				[3, 4, 5],
				[4, 5, 6],
				[5, 6, 7],
				[6, 7, 8],
				[7, 8, 9],
				[8, 9, 0],
			];
			const result = groupCoordinates(arr, groupSize);
			expect(result).toEqual(expected);
		});

		it('should group an array correctly', () => {
			const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
			const groupSize = 9;
			const expected = [
				[1, 2, 3, 4, 5, 6, 7, 8, 9],
				[2, 3, 4, 5, 6, 7, 8, 9, 0],
			];
			const result = groupCoordinates(arr, groupSize);
			expect(result).toEqual(expected);
		});
	});

	describe('groupedSurroundingCoordinates', () => {
		it('should exist', () => {
			expect(groupedSurroundingCoordinates).toBeDefined();
			expect(typeof groupedSurroundingCoordinates).toBe('function');
		});

		it('should return correct grouped coordinates when the coord is at the center', () => {
			const row = 4;
			const col = 4;
			const size = 2;
			const expected = [
				[
					[4, 3],
					[4, 4],
				],
				[
					[4, 4],
					[4, 5],
				],
				[
					[3, 4],
					[4, 4],
				],
				[
					[4, 4],
					[5, 4],
				],
			];
			const result = groupedSurroundingCoordinates(row, col, size);

			expect(result).toEqual(expected);
		});

		it('should return correct grouped coordinates when the coord is at top left corner', () => {
			const row = 0;
			const col = 0;
			const size = 5;
			// [0 0, 0 1, 0 2, 0 3, 0 4]
			// [0 0, 1 0, 2 0, 3 0, 4 0]
			const expected = [
				[
					[0, 0],
					[0, 1],
					[0, 2],
					[0, 3],
					[0, 4],
				],
				[
					[0, 0],
					[1, 0],
					[2, 0],
					[3, 0],
					[4, 0],
				],
			];
			const result = groupedSurroundingCoordinates(row, col, size);

			expect(result).toEqual(expected);
		});

		it('should return correct grouped coordinates when the coord is at bottom right corner', () => {
			const row = 9;
			const col = 9;
			const size = 4;
			// [6 9, 7 9, 8 9, 9 9]
			// [6 6, 6 7, 6 8, 6 9]
			const expected = [
				[
					[9, 6],
					[9, 7],
					[9, 8],
					[9, 9],
				],
				[
					[6, 9],
					[7, 9],
					[8, 9],
					[9, 9],
				],
			];
			const result = groupedSurroundingCoordinates(row, col, size);

			expect(result).toEqual(expected);
		});

		it('should return correct grouped coordinates when the coord is at left middle', () => {
			const row = 4;
			const col = 0;
			const size = 3;
			// [6 9, 7 9, 8 9, 9 9]
			// [6 6, 6 7, 6 8, 6 9]
			const expected = [
				[
					[4, 0],
					[4, 1],
					[4, 2],
				],
				[
					[2, 0],
					[3, 0],
					[4, 0],
				],
				[
					[3, 0],
					[4, 0],
					[5, 0],
				],
				[
					[4, 0],
					[5, 0],
					[6, 0],
				],
			];
			const result = groupedSurroundingCoordinates(row, col, size);

			expect(result).toEqual(expected);
		});
	});
});
