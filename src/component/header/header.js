import './header.css';

import { ComputerPlayer } from '../../script/computer-players/computer-player.js';
import { HumanPlayer } from '../../script/human-player.js';

export function Header(game) {
	const header = document.createElement('header');
	header.className = 'header';

	// Brand
	const brand = document.createElement('div');
	brand.className = 'brand';
	brand.textContent = 'Battleship';
	header.appendChild(brand);

	const gameInfo = document.createElement('div');
	gameInfo.className = 'game-info';

	// Game info
	let infoMsg = '';

	if (game.isGameRunning === false) {
		infoMsg = 'Place the ships.';
	} else {
		infoMsg = `${
			game.currentPlayer instanceof HumanPlayer ? 'Your' : "Bot's"
		} turn.`;
	}

	if (game.isGameOver) {
		if (game.winner instanceof HumanPlayer) {
			infoMsg = 'Game over. You win!';
			gameInfo.className += ' win';
		} else if (game.winner instanceof ComputerPlayer) {
			infoMsg = 'Game over. You lose!';
			gameInfo.className += ' lose';
		} else {
			('Game over. No winner.');
		}
	}

	const message = document.createElement('div');
	message.className = 'message';
	message.textContent = infoMsg;

	gameInfo.appendChild(message);
	header.appendChild(gameInfo);

	// Fill empty to make game info center
	const empty = document.createElement('div');
	empty.className = 'fill-empty';
	header.appendChild(empty);

	return header;
}
