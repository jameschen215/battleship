import './controls.css';

export function Controls() {
	const controls = document.createElement('div');
	controls.className = 'controls';

	const randomButton = document.createElement('button');
	randomButton.className = 'random-btn';
	randomButton.innerHTML = 'Random';
	controls.appendChild(randomButton);

	const restartButton = document.createElement('button');
	restartButton.className = 'restart-btn';
	restartButton.innerHTML = 'Restart';
	controls.appendChild(restartButton);

	const soundButton = document.createElement('button');
	soundButton.className = 'sound-btn';
	soundButton.innerHTML = 'Sound';
	controls.appendChild(soundButton);

	return controls;
}
