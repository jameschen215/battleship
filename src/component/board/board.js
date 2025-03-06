import './board.css';
import { range } from '../../script/utils.js';
import { ComputerPlayer, HumanPlayer } from '../../script/player.js';
import { ShipComponent } from '../ship-component/ship-component.js';
import { CELL_SIZE } from '../../script/constants.js';

export function Board(game, player) {
	const { isGameRunning, isGameOver, currentPlayer, handleClick } = game;
	const gameboard = player.gameboard;

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

	// Shake animation
	const shakeElement = (element, duration = 200, shakeDistance = 5) => {
		element.style.transition = `transform ${duration / 4}ms ease-in-out`;
		element.style.transform = `translateX(${shakeDistance}px)`;
		element.style.borderColor = 'red';

		setTimeout(() => {
			element.style.transform = `translateX(-${shakeDistance}px)`;
			setTimeout(() => {
				element.style.transform = `translateX(${shakeDistance / 2}px)`;
				setTimeout(() => {
					element.style.transform = `translateX(-${shakeDistance / 2}px)`;
					setTimeout(() => {
						element.style.transform = `translateX(0)`;
						element.style.transition = ''; // Remove transition for future changes if needed.
						element.style.borderColor = 'green'; // Remove transition for future changes if needed.
					}, duration / 4);
				}, duration / 4);
			}, duration / 4);
		}, duration / 4);
	};

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

	// Rotate ship handler
	const switchDirection = (direction) =>
		direction === 'horizontal' ? 'vertical' : 'horizontal';

	const rotateShipHandler = (event) => {
		const size = Number(event.target.dataset.size);
		const direction = event.target.dataset.direction;
		const startRow = Number(event.target.dataset.startRow);
		const startCol = Number(event.target.dataset.startCol);
		const index = Number(event.target.id.split('-')[1]);

		const originalShips = gameboard.ships;
		gameboard.ships = gameboard.ships.filter((_, i) => i !== index);
		const { success } = gameboard.placeShip(
			size,
			startRow,
			startCol,
			switchDirection(direction)
		);

		if (!success) {
			gameboard.ships = originalShips;
			shakeElement(event.target);
		} else {
			game.updateUI();
		}
	};

	const dropHandler = (event) => {
		event.preventDefault();
		const draggedId = event.dataTransfer.getData('text/plain');
		const draggedIndex = Number(draggedId.split('-')[1]);
		const [endRow, endCol] = event.target.dataset.coordinate
			.split(',')
			.map(Number);
		const draggedEle = document.getElementById(draggedId);
		const direction = draggedEle.dataset.direction;
		const size = Number(draggedEle.dataset.size);

		const originalShips = gameboard.ships;
		gameboard.ships = gameboard.ships.filter((_, i) => i !== draggedIndex);
		const { success } = gameboard.placeShip(size, endRow, endCol, direction);
		if (!success) gameboard.ships = originalShips;

		game.updateUI();
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
	gameboard.board.forEach((row, i) => {
		row.forEach((cell, j) => {
			const cellDom = document.createElement('div');
			cellDom.className = `cell ${cell.state}`;
			cellDom.dataset.coordinate = `${i},${j}`;
			cellDom.innerHTML = cellContent[cell.state];
			cellDom.addEventListener('dragover', (e) => e.preventDefault());
			cellDom.addEventListener('drop', dropHandler);
			boardDom.appendChild(cellDom);
		});
	});

	// Place ships on board
	const ships = document.createElement('div');
	ships.className = 'ships';
	gameboard.ships.forEach(({ ship, positions }, index) => {
		const shipComponent = ShipComponent(ship, positions, index);
		shipComponent.addEventListener('click', rotateShipHandler);
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
