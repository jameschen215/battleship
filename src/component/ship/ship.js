import './ship.css';

import { CELL_SIZE } from '../../script/constants.js';

export function Ship(ship, positions, index) {
	const [startRow, startCol] = positions[0];

	const shipDom = document.createElement('div');
	shipDom.id = `ship-${index}`;
	shipDom.className = `ship ship-${ship.size} ${ship.direction}`;
	shipDom.dataset.index = index;
	shipDom.dataset.size = ship.size;
	shipDom.dataset.direction = ship.direction;
	shipDom.dataset.startCoordinate = `${startRow},${startCol}`;
	shipDom.draggable = true;

	shipDom.style.top = startRow * CELL_SIZE + 2 + 'px';
	shipDom.style.left = startCol * CELL_SIZE + 2 + 'px';

	let clickedComponent = null;
	shipDom.addEventListener('mousedown', (event) => {
		clickedComponent = event.target.closest('div.ship-component');
	});

	shipDom.addEventListener('dragstart', (event) => {
		if (clickedComponent) {
			event.dataTransfer.setData('text/plain', shipDom.id);
			event.dataTransfer.setData(
				'shipComponentIndex',
				clickedComponent.dataset.index
			);
		} else {
			console.log('No drag component');
		}
	});

	shipDom.addEventListener('drag', (event) => {
		shipDom.style.pointerEvents = 'none';
	});

	shipDom.addEventListener('dragend', (event) => {
		shipDom.style.pointerEvents = 'auto';
	});

	if (ship.isSunk()) {
		shipDom.classList.add('sunk');
	}

	// Add ship components
	positions.forEach((_, index) => {
		shipDom.appendChild(ShipComponent(index));
	});

	return shipDom;
}

function ShipComponent(index) {
	const shipComponent = document.createElement('div');
	shipComponent.className = 'ship-component';
	shipComponent.dataset.index = index;

	return shipComponent;
}
