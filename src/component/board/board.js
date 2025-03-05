import './board.css';
import { range } from '../../script/utils.js';
import { ComputerPlayer, HumanPlayer } from '../../script/player.js';
import { ShipComponent } from '../ship-component/ship-component.js';

export function Board(game, player) {
	const { isGameRunning, isGameOver, currentPlayer, handleClick } = game;
	const board = player.gameboard.board;

	const cellContent = {
		hit: 'H',
		miss: 'M',
		empty: '',
	};

	const labelNumbers = range(10).map((num) => num + 1);
	const labelLetters = range(10).map((num) => String.fromCharCode(num + 65));

	const topLabel = labelNumbers
		.map((num) => `<div class="label">${num}</div>`)
		.join('');
	const sideLabel = labelLetters
		.map((letter) => `<div class="label">${letter}</div>`)
		.join('');

	// Cell event handler
	const clickHandler = (event) => {
		// Left-click only
		if (event.type === 'click' && event.button === 0) {
			const cellDom = event.target.closest('div.cell');

			if (!cellDom || !cellDom.classList.contains('empty')) return;

			const [row, col] = cellDom.dataset.coordinate.split(',').map(Number);

			console.log(row, col);
			handleClick(row, col);
		}
	};

	const html = document.createElement('div');
	html.className = `board-container ${
		player instanceof ComputerPlayer ? 'bot' : 'human'
	}`;

	const topLabelContainer = document.createElement('div');
	topLabelContainer.className = 'top-label';
	topLabelContainer.innerHTML = topLabel;
	html.appendChild(topLabelContainer);

	const sideLabelContainer = document.createElement('div');
	sideLabelContainer.className = 'side-label';
	sideLabelContainer.innerHTML = sideLabel;
	html.appendChild(sideLabelContainer);

	const boardDom = document.createElement('div');
	boardDom.id = `${player instanceof ComputerPlayer ? 'bot' : 'human'}-board`;
	boardDom.className =
		(currentPlayer instanceof HumanPlayer && isGameRunning) || isGameOver
			? 'board'
			: 'board disabled';

	if (player instanceof ComputerPlayer) {
		boardDom.addEventListener('click', clickHandler);
	}
	// Append cells
	board.forEach((row, i) => {
		row.forEach((cell, j) => {
			const cellDom = document.createElement('div');
			cellDom.className = `cell ${cell.state}`;
			cellDom.dataset.coordinate = `${i},${j}`;
			cellDom.innerHTML = cellContent[cell.state];

			boardDom.appendChild(cellDom);
		});
	});

	const ships = document.createElement('div');
	ships.className = 'ships';
	player.gameboard.ships.forEach(({ ship, positions }) => {
		const shipComponent = ShipComponent(ship, positions);
		ships.appendChild(shipComponent);
	});

	boardDom.appendChild(ships);

	html.appendChild(boardDom);

	const boardTitle = document.createElement('div');
	boardTitle.className = 'board-title';
	boardTitle.textContent =
		player instanceof ComputerPlayer ? "Bot's grid" : 'Your grid';
	html.appendChild(boardTitle);

	return html;
}
