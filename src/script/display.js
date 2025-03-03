import { App } from '../component/app/app.js';

export function display(game) {
	const container = document.querySelector('#container');
	// container.innerHTML = '';

	// container.appendChild(App(game));
	container.replaceChildren(App(game));
}
