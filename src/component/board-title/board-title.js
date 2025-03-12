import './board-title.css';

import { ComputerPlayer } from '../../script/computer-players/computer-player.js';

export function BoardTitle(player) {
	const container = document.createElement('div');
	container.className = 'board-title';
	container.textContent =
		player instanceof ComputerPlayer ? "BOT'S GRID" : 'YOUR GRID';

	return container;
}
