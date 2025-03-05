import './style/reset.css';
import './style/main.css';

import { Game } from './script/game.js';

const game = new Game();
game.initializeGame();
game.updateUI();
