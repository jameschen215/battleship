import { getRandomInt } from './utils.js';
import { isCoordinateOnBoard } from './helpers.js';

import { HumanPlayer } from './human-player.js';
import { EasyComputerPlayer } from './computer-players/easy-computer-player.js';
import { NormalComputerPlayer } from './computer-players/normal-computer-player.js';
import { HardComputerPlayer } from './computer-players/hard-computer-player.js';

import { display } from './display.js';

export class Game {
	/** Initializes a new Battleship game with human and computer players. */
	constructor() {
		this.human = new HumanPlayer();
		this.bot = new NormalComputerPlayer();
		this.handleClick = this.handleClick.bind(this);
		this.updateUI = this.updateUI.bind(this);
	}

	initializeGame() {
		this.human.gameboard.setBoard();
		this.bot.gameboard.setBoard();
		this.human.placeShips();
		this.bot.placeShips();
		this.bot.resetHistory();

		this.currentPlayer = this.human;
		this.isGameOver = false;
		this.winner = null;
		this.isGameRunning = false;
		this.coordinateResolve = null;
	}

	setDifficulty(desc) {
		if (desc === 'easy') {
			this.bot = new EasyComputerPlayer();
		} else if (desc === 'hard') {
			this.bot = new HardComputerPlayer();
		} else {
			this.bot = new NormalComputerPlayer();
		}
	}

	// Delay function for bot thinking
	delay() {
		return new Promise((resolve) =>
			setTimeout(resolve, getRandomInt(250, 3000))
		);
	}

	switchTurn() {
		this.currentPlayer =
			this.currentPlayer === this.human ? this.bot : this.human;
	}

	async playTurn(row, col) {
		if (this.isGameOver) return;

		if (this.currentPlayer === this.human) {
			if (!isCoordinateOnBoard(row, col)) return;

			this.human.attack(this.bot.gameboard, row, col);
		} else {
			console.log('Computer is thinking...');
			await this.delay();
			const { row: r, col: c } = this.bot.attack(this.human.gameboard);
			console.log(`Computer attacked (${r}, ${c})`);
		}

		this.switchTurn();
	}

	checkWinner() {
		if (this.bot.gameboard.allSunk()) {
			this.isGameOver = true;
			this.isGameRunning = false;
			this.winner = this.human;
		} else if (this.human.gameboard.allSunk()) {
			this.isGameOver = true;
			this.isGameRunning = false;
			this.winner = this.bot;
		} else {
			this.isGameOver = false;
			this.isGameRunning = true;
			this.winner = null;
		}
	}

	updateUI() {
		display(this);
	}

	async runGame() {
		// let turns = 0;
		this.isGameRunning = true;

		while (!this.isGameOver) {
			if (this.currentPlayer === this.human) {
				try {
					const { row, col } = await this.getUserInput();
					this.playTurn(row, col);
				} catch (error) {
					console.log(error);
					continue;
				}
			} else {
				await this.playTurn();
			}

			this.checkWinner();
			this.updateUI();
		}

		if (this.winner !== null) {
			this.updateUI();
			console.log(`Game Over! ${this.winner.name} wins!`);
		} else {
			console.log('No winner.');
		}
	}

	getUserInput() {
		return new Promise((resolve) => {
			this.coordinateResolve = resolve;
		});
	}

	handleClick(row, col) {
		if (this.coordinateResolve !== null) {
			this.coordinateResolve({ row, col });
			this.coordinateResolve = null;
		}
	}
}
