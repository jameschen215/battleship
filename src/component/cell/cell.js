import './cell.css';

const CELL_CONTENT = {
	hit: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
	miss: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-dot-dashed"><path d="M10.1 2.18a9.93 9.93 0 0 1 3.8 0"/><path d="M17.6 3.71a9.95 9.95 0 0 1 2.69 2.7"/><path d="M21.82 10.1a9.93 9.93 0 0 1 0 3.8"/><path d="M20.29 17.6a9.95 9.95 0 0 1-2.7 2.69"/><path d="M13.9 21.82a9.94 9.94 0 0 1-3.8 0"/><path d="M6.4 20.29a9.95 9.95 0 0 1-2.69-2.7"/><path d="M2.18 13.9a9.93 9.93 0 0 1 0-3.8"/><path d="M3.71 6.4a9.95 9.95 0 0 1 2.7-2.69"/><circle cx="12" cy="12" r="1"/></svg>`,
	empty: '',
};

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

			if (shipDom.dataset.direction === 'horizontal') {
				endRow = cellRow;
				endCol = cellCol - componentIndex;
			} else {
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

	cellDom.addEventListener('dragover', (e) => e.preventDefault());
	cellDom.addEventListener('drop', dropHandler);

	return cellDom;
}
