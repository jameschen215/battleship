import './board.css';

import { shakeElement } from '../../script/helpers.js';

import { ComputerPlayer } from '../../script/computer-players/computer-player.js';
import { HumanPlayer } from '../../script/human-player.js';

import { Ship } from '../ship/ship.js';
import { Cell } from '../cell/cell.js';

export function Board(game, player) {
	const gameboard = player.gameboard;
	const {
		isGameRunning,
		isGameOver,
		currentPlayer,
		handleClickOnCell,
		updateUI,
	} = game;

	const container = document.createElement('div');

	container.id = `${player instanceof ComputerPlayer ? 'bot' : 'human'}-board`;
	container.className =
		(currentPlayer instanceof HumanPlayer && isGameRunning) || isGameOver
			? 'board'
			: 'board disabled';

	// Cell event handler
	const clickHandler = (event) => {
		// Left-click only
		if (event.type === 'click' && event.button === 0) {
			const cellDom = event.target.closest('div.cell');

			if (!cellDom || !cellDom.classList.contains('empty')) return;

			const [row, col] = cellDom.dataset.coordinate.split(',').map(Number);

			handleClickOnCell(row, col);
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
			updateUI();
		}
	};

	// Add event handler to bot's board
	if (player instanceof ComputerPlayer) {
		container.addEventListener('click', clickHandler);
	}

	// Append cells
	gameboard.board.forEach((row, i) => {
		row.forEach((cell, j) => {
			const cellDom = Cell(cell.state, i, j, gameboard, updateUI);
			container.appendChild(cellDom);
		});
	});

	// Place ships on board
	gameboard.ships.forEach(({ ship, positions }, index) => {
		const shipDom = Ship(ship, positions, index, isGameOver, isGameRunning);
		shipDom.addEventListener('click', rotateShipHandler);
		container.appendChild(shipDom);
	});

	return container;
}
