import './battlefield.css';

import { Board } from '../board/board.js';
import { StatShips } from '../stat-ships/stat-ships.js';

export function Battlefield(game) {
	const humanBoardContainer = Board(game, game.human);
	const botBoardContainer = Board(game, game.bot);

	const humanStatShips = StatShips(game.human);
	const botStatShips = StatShips(game.bot);

	const battlefieldDom = document.createElement('div');
	battlefieldDom.className = `battlefields ${
		game.isGameOver ? 'disabled' : ''
	}`;

	// Human side
	const humanSideDom = document.createElement('div');
	humanSideDom.className = 'human-side battlefield';
	humanSideDom.appendChild(humanStatShips);
	humanSideDom.appendChild(humanBoardContainer);

	// Bot side
	const botSideDom = document.createElement('div');
	botSideDom.className = 'bot-side battlefield';
	botSideDom.appendChild(botBoardContainer);
	botSideDom.appendChild(botStatShips);

	// Append children
	battlefieldDom.appendChild(humanSideDom);
	battlefieldDom.appendChild(botSideDom);

	return battlefieldDom;
}
