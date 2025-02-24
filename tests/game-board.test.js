import { createGameBoard } from '../src/script/game-board.js';

describe('createGameBoard', () => {
	// Test 1: Check if createGameBoard exists and is a function
	it('should exist and be a function', () => {
		expect(createGameBoard).toBeDefined();
		expect(typeof createGameBoard).toBe('function');
	});

	// Test 2: Check if the function has no parameter
	it('should require no parameter', () => {
		expect(() => createGameBoard(2)).toThrow(
			'The factory function does not require any parameters.'
		);
	});

	// Test 3: Check if it returns a game board object with expected properties
	it('should return a ship object with correct properties', () => {
		const gameBoard = createGameBoard();

		expect(gameBoard).toBeDefined();
		expect(gameBoard).toBeInstanceOf(Object);
		expect(typeof gameBoard.setBoard).toBe('function');
		expect(typeof gameBoard.getBoard).toBe('function');
		expect(typeof gameBoard.placeShip).toBe('function');
		expect(typeof gameBoard.getShips).toBe('function');
		expect(typeof gameBoard.receiveAttack).toBe('function');
		expect(typeof gameBoard.allSunk).toBe('function');
	});

	// Test 4: Check if setBoard method works properly
	describe('setBoard method', () => {
		let gameBoard;

		beforeEach(() => {
			gameBoard = createGameBoard();
		});

		it('should place every cell in board with state 0', () => {
			gameBoard.setBoard();

			expect(gameBoard.getBoard()).toBeInstanceOf(Array);

			gameBoard.getBoard().forEach((row) => {
				row.forEach((cell) => {
					expect(cell.getState()).toBe(0);
				});
			});
		});
	});

	// Test 5: Check if getBoard method works properly
	describe('getBoard method', () => {
		let gameBoard;

		beforeEach(() => {
			gameBoard = createGameBoard();
		});

		it('should return an empty board before setBoard', () => {
			expect(gameBoard.getBoard()).toBeInstanceOf(Array);
			expect(gameBoard.getBoard()).toEqual([]);
		});

		it('The board should be returned with the state of all its cells set to 0.', () => {
			gameBoard.setBoard();
			expect(gameBoard.getBoard()).toBeInstanceOf(Array);
			gameBoard.getBoard().forEach((row) => {
				row.forEach((cell) => {
					expect(cell.getState()).toBe(0);
				});
			});
		});
	});

	// Test 5: Check if placeShip method works properly
	describe('placeShip method', () => {
		let gameBoard;

		beforeEach(() => {
			gameBoard = createGameBoard();
			gameBoard.setBoard();
		});

		it('should place 10 ships correctly', () => {
			gameBoard.placeShip(4, 0, 0, 'horizontal'); // 4-cell ship
			gameBoard.placeShip(3, 1, 0, 'horizontal'); // 3-cell ship 1
			gameBoard.placeShip(3, 2, 0, 'horizontal'); // 3-cell ship 2
			gameBoard.placeShip(2, 3, 0, 'horizontal'); // 2-cell ship 1
			gameBoard.placeShip(2, 4, 0, 'horizontal'); // 2-cell ship 2
			gameBoard.placeShip(2, 5, 0, 'horizontal'); // 2-cell ship 3
			gameBoard.placeShip(1, 6, 0, 'horizontal'); // 1-cell ship 1
			gameBoard.placeShip(1, 7, 0, 'horizontal'); // 1-cell ship 2
			gameBoard.placeShip(1, 8, 0, 'horizontal'); // 1-cell ship 3
			gameBoard.placeShip(1, 9, 0, 'horizontal'); // 1-cell ship 4

			const ships = gameBoard.getShips();
			expect(ships.length).toBe(10);

			const sizes = ships.map((s) => s.ship.size);
			expect(sizes).toContain(4);
			expect(sizes.filter((size) => size === 3).length).toBe(2);
			expect(sizes.filter((size) => size === 2).length).toBe(3);
			expect(sizes.filter((size) => size === 1).length).toBe(4);

			// Check positions
			const fourCellShip = ships.find((s) => s.ship.size === 4);
			expect(fourCellShip.positions).toEqual([
				[0, 0],
				[0, 1],
				[0, 2],
				[0, 3],
			]);
		});

		it('should reject overlapping ships', () => {
			gameBoard.placeShip(4, 0, 0, 'horizontal');
			expect(() => gameBoard.placeShip(3, 0, 0, 'horizontal')).toThrow(
				'Ship overlaps another ship.'
			);
		});

		it('should reject out-of-bounds ship', () => {
			expect(() => gameBoard.placeShip(4, 0, 7, 'horizontal')).toThrow(
				'Ship placement out of bounds.'
			);
		});
	});

	describe('getShips method', () => {
		let gameBoard;

		beforeEach(() => {
			gameBoard = createGameBoard();
			gameBoard.setBoard();

			gameBoard.placeShip(4, 0, 0, 'horizontal'); // A1-A4
			gameBoard.placeShip(3, 1, 0, 'horizontal'); // B1-B3
			gameBoard.placeShip(3, 2, 0, 'horizontal'); // C1-C3
			gameBoard.placeShip(2, 3, 0, 'horizontal'); // D1-D2
			gameBoard.placeShip(2, 4, 0, 'horizontal'); // E1-E2
			gameBoard.placeShip(2, 5, 0, 'horizontal'); // F1-F2
			gameBoard.placeShip(1, 6, 0, 'horizontal'); // G1
			gameBoard.placeShip(1, 7, 0, 'horizontal'); // H1
			gameBoard.placeShip(1, 8, 0, 'horizontal'); // I1
			gameBoard.placeShip(1, 9, 0, 'horizontal'); // J1
		});

		it('should return an array of 10 ships', () => {
			const ships = gameBoard.getShips();
			expect(ships).toHaveLength(10); // 10 ships placed
		});

		it('each ship should have correct size and initial hits', () => {
			const ships = gameBoard.getShips();
			const expectedSizes = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

			ships.forEach((shipObj, index) => {
				expect(shipObj.ship.size).toBe(expectedSizes[index]);
				expect(shipObj.ship.hits).toBe(0);
				expect(typeof shipObj.ship.hit).toBe('function');
				expect(typeof shipObj.ship.isSunk).toBe('function');
			});
		});

		it('each ship should have correct positions', () => {
			const ships = gameBoard.getShips();
			const expectedPositions = [
				[
					[0, 0],
					[0, 1],
					[0, 2],
					[0, 3],
				],
				[
					[1, 0],
					[1, 1],
					[1, 2],
				],
				[
					[2, 0],
					[2, 1],
					[2, 2],
				],
				[
					[3, 0],
					[3, 1],
				], // Size 2
				[
					[4, 0],
					[4, 1],
				],
				[
					[5, 0],
					[5, 1],
				],
				[[6, 0]],
				[[7, 0]],
				[[8, 0]],
				[[9, 0]],
			];

			ships.forEach((shipObj, index) => {
				expect(shipObj.positions).toEqual(expectedPositions[index]);
			});
		});

		it('should return empty array when no ships are placed', () => {
			const emptyBoard = createGameBoard(); // Fresh board, no ships
			expect(emptyBoard.getShips()).toEqual([]);
		});

		// todo: update hits after attacks
		it('should return ships with updated hits after attacks', () => {
			gameBoard.receiveAttack(0, 0); // Hit A1 (size-4 ship)
			gameBoard.receiveAttack(1, 0); // Hit B1 (first size-3 ship)
			const ships = gameBoard.getShips();

			expect(ships[0].ship.hits).toBe(1); // Size-4 ship hit once
			expect(ships[1].ship.hits).toBe(1); // First size-3 ship hit once
			expect(ships[2].ship.hits).toBe(0); // Second size-3 ship not hit
		});
	});

	describe('allSunk method', () => {
		let gameBoard;

		beforeEach(() => {
			gameBoard = createGameBoard();
			gameBoard.setBoard();
			// Place 10 ships as per your setup
			gameBoard.placeShip(4, 0, 0, 'horizontal'); // A1-A4
			gameBoard.placeShip(3, 1, 0, 'horizontal'); // B1-B3
			gameBoard.placeShip(3, 2, 0, 'horizontal'); // C1-C3
			gameBoard.placeShip(2, 3, 0, 'horizontal'); // D1-D2
			gameBoard.placeShip(2, 4, 0, 'horizontal'); // E1-E2
			gameBoard.placeShip(2, 5, 0, 'horizontal'); // F1-F2
			gameBoard.placeShip(1, 6, 0, 'horizontal'); // G1
			gameBoard.placeShip(1, 7, 0, 'horizontal'); // H1
			gameBoard.placeShip(1, 8, 0, 'horizontal'); // I1
			gameBoard.placeShip(1, 9, 0, 'horizontal'); // J1
		});

		it('should return false when no ships are sunk', () => {
			expect(gameBoard.allSunk()).toBe(false);
		});

		it('should return false when some ships are sunk', () => {
			// Sink the size-4 ship (A1-A4)
			gameBoard.receiveAttack(0, 0);
			gameBoard.receiveAttack(0, 1);
			gameBoard.receiveAttack(0, 2);
			gameBoard.receiveAttack(0, 3);
			expect(gameBoard.getShips()[0].ship.isSunk()).toBe(true); // Size-4 sunk
			expect(gameBoard.allSunk()).toBe(false); // Others still afloat
		});

		it('should return false when most but not all ships are sunk', () => {
			const attacks = [
				[0, 0],
				[0, 1],
				[0, 2],
				[0, 3], // Size-4
				[1, 0],
				[1, 1],
				[1, 2], // First size-3
				[2, 0],
				[2, 1],
				[2, 2], // Second size-3
				[3, 0],
				[3, 1], // First size-2
				[4, 0],
				[4, 1], // Second size-2
				[5, 0],
				[5, 1], // Third size-2
				[6, 0], // First size-1
				[7, 0], // Second size-1
				[8, 0], // Third size-1
				// J1 (9, 0) not attacked
			];
			attacks.forEach(([row, col]) => gameBoard.receiveAttack(row, col));
			expect(gameBoard.getShips().filter((s) => s.ship.isSunk()).length).toBe(
				9
			);
			expect(gameBoard.allSunk()).toBe(false); // One ship remains
		});

		it('should return true when all ships are sunk', () => {
			// Sink all 10 ships
			const attacks = [
				[0, 0],
				[0, 1],
				[0, 2],
				[0, 3], // Size-4
				[1, 0],
				[1, 1],
				[1, 2], // First size-3
				[2, 0],
				[2, 1],
				[2, 2], // Second size-3
				[3, 0],
				[3, 1], // First size-2
				[4, 0],
				[4, 1], // Second size-2
				[5, 0],
				[5, 1], // Third size-2
				[6, 0], // First size-1
				[7, 0], // Second size-1
				[8, 0], // Third size-1
				[9, 0], // Fourth size-1
			];
			attacks.forEach(([row, col]) => gameBoard.receiveAttack(row, col));
			expect(gameBoard.allSunk()).toBe(true); // All ships sunk
		});

		it('should return true for empty board (no ships)', () => {
			const emptyBoard = createGameBoard(); // No ships placed
			emptyBoard.setBoard();
			expect(emptyBoard.allSunk()).toBe(true); // No ships = all sunk (vacuously true)
		});
	});
});
