import { ComputerPlayer, HumanPlayer } from './player.js';

export class Game {
	constructor() {
		this.isGameOver = false;
		this.winner = null;
		this.human = new HumanPlayer();
		this.bot = new ComputerPlayer();
	}

	initializeGame() {
		this.currentPlayer = this.human;

		this.human.placeShips();
		this.bot.placeShips();
	}

	playTurn(row, col) {
		if (this.currentPlayer === this.human) {
			this.currentPlayer.attack(this.bot.gameboard, row, col);
			this.currentPlayer = this.bot;
		} else {
			this.currentPlayer.attack(this.human.gameboard);
			this.currentPlayer = this.human;
		}
	}

	checkWinner() {
		if (this.bot.gameboard.allSunk()) {
			this.isGameOver = true;
			this.winner = this.human;
		} else if (this.human.gameboard.allSunk()) {
			this.isGameOver = true;
			this.winner = this.bot;
		}
	}

	updateUI() {
		console.log('Update UI');
	}

	runGame() {
		let row;
		let col;

		while (!this.isGameOver) {
			if (this.currentPlayer === this.human) {
				const coordinates = this.getUserInput();
				row = coordinates.row;
				col = coordinates.col;
			}

			this.playTurn(row, col);
			this.checkWinner();
			this.updateUI();
		}
		console.log(`Game Over! ${this.winner.name} wins!`);
	}

	getUserInput() {
		return { row: 0, col: 0 };
	}
}
