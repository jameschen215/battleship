import { isCoordinateOnBoard } from './helpers.js';
import { ComputerPlayer, HumanPlayer } from './player.js';

export class Game {
	/** Initializes a new Battleship game with human and computer players. */
	constructor() {
		this.human = new HumanPlayer();
		this.bot = new ComputerPlayer();
	}

	initializeGame() {
		this.human.placeShips();
		this.bot.placeShips();
		this.currentPlayer = this.human;
		this.isGameOver = false;
		this.winner = null;
	}

	playTurn(row, col) {
		if (this.isGameOver) return;

		if (this.currentPlayer === this.human) {
			if (!isCoordinateOnBoard(row, col)) return;

			this.currentPlayer = this.bot;
			return this.human.attack(this.bot.gameboard, row, col);
		} else {
			this.currentPlayer = this.human;
			return this.bot.attack(this.human.gameboard);
		}
	}

	checkWinner() {
		if (this.bot.gameboard.allSunk()) {
			this.isGameOver = true;
			this.winner = this.human;
		} else if (this.human.gameboard.allSunk()) {
			this.isGameOver = true;
			this.winner = this.bot;
		} else {
			this.isGameOver = false;
			this.winner = null;
		}
	}

	updateUI() {
		console.log('Update UI');
	}

	runGame() {
		let row;
		let col;
		let turns = 0;

		while (!this.isGameOver && turns++ < 5) {
			if (this.currentPlayer === this.human) {
				const coordinates = this.getUserInput();
				row = coordinates.row;
				col = coordinates.col;
			}

			this.playTurn(row, col);
			this.checkWinner();
			this.updateUI();
		}

		if (this.winner !== null) {
			console.log(`Game Over! ${this.winner.name} wins!`);
		} else {
			console.log('No winner.');
		}
	}

	getUserInput() {
		// TODO: Replace with UI input logic
		return { row: 0, col: 0 };
	}
}
