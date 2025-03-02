import './stat-ships.css';

import { range } from '../../script/utils.js';

export function StatShips(player) {
	const ships = document.createElement('div');
	ships.className = `ships-for-stats`;

	player.gameboard.ships.forEach(({ ship }) =>
		ships.appendChild(StatShip(ship))
	);

	return ships;
}

function StatShip(ship) {
	const shipDom = document.createElement('div');
	shipDom.className = `ship-for-stats ${ship.isSunk() ? 'sunk' : ''}`;

	range(ship.size).forEach((_) => {
		const component = document.createElement('div');
		component.className = 'ship-for-stats-component';
		shipDom.appendChild(component);
	});

	return shipDom;
}
