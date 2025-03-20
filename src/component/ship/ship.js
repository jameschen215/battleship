import './ship.css';

import { CELL_SIZE } from '../../script/constants.js';

export function Ship(ship, positions, index, isGameOver, isGameRunning) {
	const [startRow, startCol] = positions[0];

	const shipDom = document.createElement('div');
	shipDom.id = `ship-${index}`;
	shipDom.className = `ship ship-${ship.size} ${ship.direction} ${
		isGameRunning ? 'disabled' : ''
	}`;
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

	/**
	 * When drag starts, make ship ignore interactive pointer events,
	 * or you cannot drop on cells which are under the ship itself.
	 *
	 * Example:
	 * Say, you have a 3-component horizontal ship, and you click on the left
	 * most component of the ship and drag it to one cell right, which is
	 * always under the ship, so you can never drop the ship onto it. By setting
	 * the ship's pointerEvents to 'none', you can interact with overlapped cells.
	 */
	shipDom.addEventListener('drag', () => {
		shipDom.style.pointerEvents = 'none';
	});

	/**
	 * Once an element's 'pointerEvents' are set to 'none', you cannot interact
	 * with it, so to make the ship rotate by clicking on it, we have to make
	 * it clickable again after dragging.
	 */
	shipDom.addEventListener('dragend', () => {
		shipDom.style.pointerEvents = 'auto';
	});

	if (ship.isSunk() || isGameOver) {
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
