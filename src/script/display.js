import { App } from '../component/app/app.js';

export function display(game) {
	const container = document.querySelector('body');

	container.replaceChildren(App(game));
}
