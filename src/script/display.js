import { App } from '../component/app/app.js';

export function display(game) {
	const container = document.querySelector('#container');

	container.replaceChildren(App(game));
}
