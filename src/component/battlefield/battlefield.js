import './battlefield.css';

import { StatShips } from '../stat-ships/stat-ships.js';
import { BoardContainer } from '../board-container/board-container.js';

export function Battlefield(game) {
	const battlefieldDom = document.createElement('div');
	battlefieldDom.className = `battlefields ${
		game.isGameOver ? 'disabled' : ''
	}`;

	// Human side
	const humanSideDom = document.createElement('div');
	humanSideDom.className = 'human-side battlefield';

	humanSideDom.appendChild(StatShips(game.human));
	humanSideDom.appendChild(BoardContainer(game, game.human));

	battlefieldDom.appendChild(humanSideDom);

	// Bot side
	const botSideDom = document.createElement('div');
	botSideDom.className = 'bot-side battlefield';

	botSideDom.appendChild(BoardContainer(game, game.bot));
	botSideDom.appendChild(StatShips(game.bot));

	battlefieldDom.appendChild(botSideDom);

	return battlefieldDom;
}
