import './style/reset.css';
import './style/main.css';

import { Game } from './script/game.js';

import { updateUI } from './script/updateUI.js';

const game = new Game();
game.initializeGame();

updateUI(game);
