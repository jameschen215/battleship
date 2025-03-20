import { getRandomInt } from './utils.js';
import { isCoordinateOnBoard } from './helpers.js';

import { display } from './display.js';

import { HumanPlayer } from './human-player.js';
import { EasyComputerPlayer } from './computer-players/easy-computer-player.js';
import { NormalComputerPlayer } from './computer-players/normal-computer-player.js';
import { HardComputerPlayer } from './computer-players/hard-computer-player.js';

export class Game {
	constructor() {
		this.human = new HumanPlayer();
		this.bot = new NormalComputerPlayer();
		this.handleClickOnCell = this.handleClickOnCell.bind(this);
		this.updateUI = this.updateUI.bind(this);
		this.coordinateResolve = null;
	}

	// Delay function for bot thinking
	#delay() {
		return new Promise((resolve) =>
			setTimeout(resolve, getRandomInt(250, 1000))
		);
	}

	#switchTurn() {
		this.currentPlayer =
			this.currentPlayer === this.human ? this.bot : this.human;
	}

	#getUserInput() {
		return new Promise((resolve) => {
			this.coordinateResolve = resolve;
		});
	}

	async #playTurn(row, col) {
		if (this.isGameOver) return;

		if (this.currentPlayer === this.human) {
			if (!isCoordinateOnBoard(row, col)) return;

			const { result } = this.human.attack(this.bot.gameboard, row, col);

			if (!result.hit) this.#switchTurn();
		} else {
			console.log('Computer is thinking...');
			await this.#delay();
			const { row: r, col: c, result } = this.bot.attack(this.human.gameboard);
			console.log(`Computer attacked (${r}, ${c})`);

			if (!result.hit) this.#switchTurn();
		}
		// this.#switchTurn();
	}

	#checkWinner() {
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

	setDifficulty(difficulty) {
		if (difficulty === 'easy') {
			this.bot = new EasyComputerPlayer();
		} else if (difficulty === 'hard') {
			this.bot = new HardComputerPlayer();
		} else {
			this.bot = new NormalComputerPlayer();
		}

		this.initializeGame();
	}

	updateUI() {
		display(this);
	}

	async runGame() {
		this.isGameRunning = true;

		while (!this.isGameOver) {
			if (this.currentPlayer === this.human) {
				try {
					const { row, col } = await this.#getUserInput();

					this.#playTurn(row, col);
				} catch (error) {
					console.log('Error in runGame:', error);
					continue;
				}
			} else {
				await this.#playTurn();
			}

			this.#checkWinner();
			this.updateUI();
		}

		console.log(
			`Game ended. Winner: ${this.winner ? this.winner.name : 'None'}`
		);
	}

	handleClickOnCell(row, col) {
		if (this.coordinateResolve !== null) {
			this.coordinateResolve({ row, col });
			this.coordinateResolve = null;
		}
	}
}
