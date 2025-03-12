import './board-container.css';

import { ComputerPlayer } from '../../script/computer-players/computer-player.js';
import { BoardLabel } from '../board-label/board-label.js';
import { BoardTitle } from '../board-title/board-title.js';
import { Board } from '../board/board.js';

export function BoardContainer(game, player) {
	const container = document.createElement('div');

	container.className = `
		board-container ${player instanceof ComputerPlayer ? 'bot' : 'human'}
	`;

	// Add top label
	container.appendChild(BoardLabel('top'));

	// Add side label
	container.appendChild(BoardLabel('side'));

	// Add board
	container.appendChild(Board(game, player));

	// Add board title
	container.appendChild(BoardTitle(player));

	return container;
}
