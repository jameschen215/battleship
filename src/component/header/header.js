import './header.css';

import difficultyIcon from '../../images/difficulty-icon.png';

import { DOWN_ANGLE } from '../../script/constants.js';

import { ComputerPlayer } from '../../script/computer-players/computer-player.js';
import { HumanPlayer } from '../../script/human-player.js';
import { EasyComputerPlayer } from '../../script/computer-players/easy-computer-player.js';
import { HardComputerPlayer } from '../../script/computer-players/hard-computer-player.js';

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
		infoMsg = 'Place your ships.';
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

	// Dropdown
	let difficulty = null;
	if (game.bot instanceof EasyComputerPlayer) {
		difficulty = 'Easy';
	} else if (game.bot instanceof HardComputerPlayer) {
		difficulty = 'Hard';
	} else {
		difficulty = 'Normal';
	}

	const dropdownContainer = document.createElement('div');
	dropdownContainer.className = 'dropdown-container';

	const difficultyIconDom = document.createElement('div');
	difficultyIconDom.className = 'difficulty-icon';
	// difficultyIconDom.innerHTML = DIFFICULTY_ICON;
	const image = document.createElement('img');
	image.src = difficultyIcon;
	image.alt = 'Difficulty icon';
	difficultyIconDom.appendChild(image);

	dropdownContainer.appendChild(difficultyIconDom);

	const triggerButton = document.createElement('button');
	triggerButton.id = 'dropdown-trigger';
	triggerButton.className = `dropdown-trigger ${
		game.isGameRunning ? 'disabled' : ''
	}`;

	const buttonText = document.createElement('div');
	buttonText.classList = 'button-text';
	buttonText.textContent = difficulty;

	const dropdownIcon = document.createElement('div');
	dropdownIcon.className = 'dropdown-icon';
	dropdownIcon.innerHTML = DOWN_ANGLE;

	// Add event listener
	triggerButton.addEventListener('click', (event) => {
		event.stopPropagation();

		dropdownDom.classList.toggle('hidden');
	});

	triggerButton.appendChild(buttonText);
	dropdownContainer.appendChild(triggerButton);
	triggerButton.appendChild(dropdownIcon);

	const dropdownDom = document.createElement('div');
	dropdownDom.id = 'dropdown';
	dropdownDom.className = 'dropdown hidden';

	// Option click handler
	const handleOptionClick = (event) => {
		const difficulty = event.currentTarget.dataset.difficulty;
		triggerButton.textContent = difficulty;
		dropdownDom.classList.add('hidden');
		game.setDifficulty(difficulty);

		game.updateUI();
	};

	const easyOption = document.createElement('button');
	easyOption.className = 'option';
	easyOption.dataset.difficulty = 'easy';

	const easyCheck = document.createElement('div');
	easyCheck.id = 'easy-check';
	easyCheck.className = `option-check ${
		triggerButton.textContent.toLocaleLowerCase() !== 'easy' ? 'invisible' : ''
	}`;
	easyCheck.textContent = '✓';
	const easyText = document.createElement('div');
	easyText.className = 'option-text';
	easyText.textContent = 'easy';
	easyOption.appendChild(easyCheck);
	easyOption.appendChild(easyText);

	easyOption.addEventListener('click', handleOptionClick);
	dropdownDom.appendChild(easyOption);

	const normalOption = document.createElement('button');
	normalOption.className = 'option';
	normalOption.dataset.difficulty = 'normal';

	const normalCheck = document.createElement('div');
	normalCheck.id = 'normal-check';
	normalCheck.className = `option-check ${
		triggerButton.textContent.toLocaleLowerCase() !== 'normal'
			? 'invisible'
			: ''
	}`;
	normalCheck.textContent = '✓';
	const normalText = document.createElement('div');
	normalText.className = 'option-text';
	normalText.textContent = 'normal';
	normalOption.appendChild(normalCheck);
	normalOption.appendChild(normalText);

	normalOption.addEventListener('click', handleOptionClick);
	dropdownDom.appendChild(normalOption);

	const hardOption = document.createElement('button');
	hardOption.className = 'option';
	hardOption.dataset.difficulty = 'hard';

	const hardCheck = document.createElement('div');
	hardCheck.id = 'hard-check';
	hardCheck.className = `option-check ${
		triggerButton.textContent.toLocaleLowerCase() !== 'hard' ? 'invisible' : ''
	}`;
	hardCheck.textContent = '✓';
	const hardText = document.createElement('div');
	hardText.className = 'option-text';
	hardText.textContent = 'hard';
	hardOption.appendChild(hardCheck);
	hardOption.appendChild(hardText);

	hardOption.addEventListener('click', handleOptionClick);
	dropdownDom.appendChild(hardOption);

	dropdownContainer.appendChild(dropdownDom);
	header.appendChild(dropdownContainer);

	// Click out of dropdown to make it hidden
	document.addEventListener('click', (event) => {
		if (!dropdownDom.classList.contains('hidden')) {
			dropdownDom.classList.add('hidden');
		}
	});

	return header;
}
