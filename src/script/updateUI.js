import { App } from '../component/app/app.js';

export function updateUI(game) {
	const container = document.querySelector('#container');

	App(game).forEach((ele) => {
		container.appendChild(ele);
	});
}
