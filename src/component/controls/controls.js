import './controls.css';

export function Controls(game) {
	const controls = document.createElement('div');
	controls.className = 'controls';

	const randomHandler = () => {
		game.human.placeShips();
		game.updateUI();
	};

	const restartHandler = () => {
		game.initializeGame();
		game.updateUI();
	};

	const playHandler = () => {
		game.runGame();
	};

	const randomButton = document.createElement('button');
	randomButton.className = 'random-btn';
	randomButton.innerHTML = 'Random';
	randomButton.addEventListener('click', randomHandler);
	controls.appendChild(randomButton);

	const playButton = document.createElement('button');
	playButton.className = 'play-btn';
	playButton.innerHTML = 'Play';
	playButton.addEventListener('click', playHandler);
	controls.appendChild(playButton);

	const restartButton = document.createElement('button');
	restartButton.className = 'restart-btn';
	restartButton.innerHTML = 'Restart';
	restartButton.addEventListener('click', restartHandler);
	controls.appendChild(restartButton);

	return controls;
}
