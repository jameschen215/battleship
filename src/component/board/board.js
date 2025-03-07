import './board.css';
import { range } from '../../script/utils.js';
import { ComputerPlayer, HumanPlayer } from '../../script/player.js';
import { Ship } from '../ship/ship.js';

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
	const rotateShipHandler = (event) => {
		// Prevent click from firing during drag - Ignore if dragged or not left-click
		if (event.defaultPrevented || event.button !== 0) return;

		const shipDom = event.currentTarget;
		const shipDirection = shipDom.dataset.direction;
		const shipIndex = Number(shipDom.dataset.index);
		const shipSize = Number(shipDom.dataset.size);
		const [startRow, startCol] = shipDom.dataset.startCoordinate
			.split(',')
			.map(Number);

		// Rotate ships:
		// 1. Remove the ship from the array of ships.
		const originalShips = gameboard.ships;
		gameboard.ships = gameboard.ships.filter((_, i) => i !== shipIndex);

		// 2. Place the ship on board again with a new direction.
		const { success } = gameboard.placeShip(
			shipSize,
			startRow,
			startCol,
			shipDirection === 'horizontal' ? 'vertical' : 'horizontal'
		);

		// 3. If the placement fails,
		// revert the array of ships to its original state, and shake.
		if (!success) {
			gameboard.ships = originalShips;
			shakeElement(event.currentTarget);
		} else {
			game.updateUI();
		}
	};

	// Drop handler
	const dropHandler = (event) => {
		event.preventDefault();

		const shipId = event.dataTransfer.getData('text/plain');
		const componentIndex = Number(
			event.dataTransfer.getData('shipComponentIndex')
		);

		const shipDom = document.getElementById(shipId);
		const shipDirection = shipDom.dataset.direction;
		const shipIndex = Number(shipDom.dataset.index);
		const shipSize = Number(shipDom.dataset.size);

		const dropX = event.clientX;
		const dropY = event.clientY;
		const cell = document.elementFromPoint(dropX, dropY).closest('div.cell');

		if (cell) {
			let endRow = null;
			let endCol = null;

			const [cellRow, cellCol] = cell.dataset.coordinate.split(',').map(Number);

			if (shipDom.dataset.direction === 'horizontal') {
				endRow = cellRow;
				endCol = cellCol - componentIndex;
			} else {
				endRow = cellRow - componentIndex;
				endCol = cellCol;
			}

			// Move ships:
			// 1. Remove the ship from the array of ships.
			const originalShips = gameboard.ships;
			gameboard.ships = gameboard.ships.filter((_, i) => i !== shipIndex);

			// 2. Place the ship on board again with a new coordinate.
			const { success } = gameboard.placeShip(
				shipSize,
				endRow,
				endCol,
				shipDirection
			);

			// 3. If the placement fails,
			// revert the array of ships to its original state.
			if (!success) gameboard.ships = originalShips;

			game.updateUI();
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
		const shipDom = Ship(ship, positions, index);
		shipDom.addEventListener('click', rotateShipHandler);
		ships.appendChild(shipDom);
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
