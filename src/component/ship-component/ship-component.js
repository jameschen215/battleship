import './ship-component.css';

import { CELL_SIZE } from '../../script/constants.js';

export function ShipComponent(ship, positions) {
	const [startRow, startCol] = positions[0];

	const shipComponent = document.createElement('div');
	shipComponent.className =
		ship.direction === 'horizontal'
			? `ship ship-h h-${ship.size}`
			: `ship ship-v v-${ship.size}`;

	if (ship.isSunk()) {
		shipComponent.classList.add('sunk');
	}

	shipComponent.style.top = startRow * CELL_SIZE + 'px';
	shipComponent.style.left = startCol * CELL_SIZE + 'px';

	return shipComponent;
}
