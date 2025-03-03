import './style/reset.css';
import './style/main.css';

import { Game } from './script/game.js';

const game = new Game();
game.initializeGame();

game.updateUI();

console.log(game.human.name);
console.log(game.bot.name);
console.log(game.currentPlayer.name);
