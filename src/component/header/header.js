import './header.css';

import { ComputerPlayer, HumanPlayer } from '../../script/player.js';

export function Header(game) {
	const header = document.createElement('header');
	header.className = 'header';

	// Brand
	const brand = document.createElement('div');
	brand.className = 'brand';
	brand.textContent = 'Battleship';
	header.appendChild(brand);

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
		} else if (game.winner instanceof ComputerPlayer) {
			infoMsg = 'Game over. You lose!';
		} else {
			('Game over. No winner.');
		}
	}

	const gameInfo = document.createElement('div');
	gameInfo.className = 'game-info';

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
