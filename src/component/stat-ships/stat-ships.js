import './stat-ships.css';

import { range } from '../../script/utils.js';

export function StatShips(player) {
	const statShips = document.createElement('div');
	statShips.className = `ships-for-stats`;

	player.gameboard.ships
		.sort((a, b) => b.ship.size - a.ship.size)
		.forEach(({ ship }) => statShips.appendChild(StatShip(ship)));

	return statShips;
}

function StatShip(ship) {
	const statShip = document.createElement('div');
	statShip.className = `ship-for-stats ${ship.isSunk() ? 'sunk' : ''}`;

	range(ship.size).forEach((_) => {
		const component = document.createElement('div');
		component.className = 'ship-for-stats-component';

		statShip.appendChild(component);
	});

	return statShip;
}
