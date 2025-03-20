import './cell.css';

import { CELL_CONTENT } from '../../script/constants.js';

export function Cell(state, row, col, gameboard, updateUI) {
	// Drop handler
	const dropHandler = (event) => {
		event.preventDefault();

		const shipId = event.dataTransfer.getData('text/plain');
		const componentIndex = Number(
			event.dataTransfer.getData('shipComponentIndex')
		);

		const shipDom = document.getElementById(shipId);
		const shipDirection = shipDom.dataset.direction;
		const shipIndex = Number(shipDom.dataset.index);
		const shipSize = Number(shipDom.dataset.size);

		const dropX = event.clientX;
		const dropY = event.clientY;
		const cell = document.elementFromPoint(dropX, dropY).closest('div.cell');

		if (cell) {
			let endRow = null;
			let endCol = null;

			const [cellRow, cellCol] = cell.dataset.coordinate.split(',').map(Number);

			if (shipDirection === 'horizontal') {
				endRow = cellRow;
				endCol = cellCol - componentIndex;
			} else if (shipDirection === 'vertical') {
				endRow = cellRow - componentIndex;
				endCol = cellCol;
			}

			// Move ships:
			// 1. Remove the ship from the array of ships.
			const originalShips = gameboard.ships;
			gameboard.ships = gameboard.ships.filter((_, i) => i !== shipIndex);

			// 2. Place the ship on board again with a new coordinate.
			const { success } = gameboard.placeShip(
				shipSize,
				endRow,
				endCol,
				shipDirection
			);

			// 3. If the placement fails,
			// revert the array of ships to its original state.
			if (!success) gameboard.ships = originalShips;

			updateUI();
		}
	};

	const cellDom = document.createElement('div');
	cellDom.className = `cell ${state}`;
	cellDom.dataset.coordinate = `${row},${col}`;
	cellDom.innerHTML = CELL_CONTENT[state];

	cellDom.addEventListener('dragover', (event) => event.preventDefault());
	cellDom.addEventListener('drop', dropHandler);

	return cellDom;
}
