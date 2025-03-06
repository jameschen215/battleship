import './ship-component.css';

import { CELL_SIZE } from '../../script/constants.js';

export function ShipComponent(ship, positions, index) {
	const [startRow, startCol] = positions[0];

	const shipComponent = document.createElement('div');
	shipComponent.className =
		ship.direction === 'horizontal'
			? `ship ship-h h-${ship.size}`
			: `ship ship-v v-${ship.size}`;

	shipComponent.dataset.direction = ship.direction;
	shipComponent.dataset.size = ship.size;
	shipComponent.dataset.startRow = startRow;
	shipComponent.dataset.startCol = startCol;

	shipComponent.id = `ship-${index}`;
	shipComponent.draggable = true;
	shipComponent.addEventListener('dragstart', (event) => {
		const startRow = event.target.dataset.startRow;
		const startCol = event.target.dataset.startCol;
		event.dataTransfer.setData('text/plain', event.target.id);
		console.log({ startRow, startCol });
	});

	if (ship.isSunk()) {
		shipComponent.classList.add('sunk');
	}

	shipComponent.style.top = startRow * CELL_SIZE + 'px';
	shipComponent.style.left = startCol * CELL_SIZE + 'px';

	return shipComponent;
}
