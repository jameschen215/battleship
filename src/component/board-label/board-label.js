import './board-label.css';

import { range } from '../../script/utils.js';

const topLabel = range(10)
	.map((num) => num + 1)
	.map((num) => `<div class="label">${num}</div>`)
	.join('');

const sideLabel = range(10)
	.map((num) => String.fromCharCode(num + 65))
	.map((letter) => `<div class="label">${letter}</div>`)
	.join('');

export function BoardLabel(position) {
	const container = document.createElement('div');
	container.className = position === 'top' ? 'top-label' : 'side-label';
	container.innerHTML = position === 'top' ? topLabel : sideLabel;

	return container;
}
