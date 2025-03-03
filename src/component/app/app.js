import './app.css';

import { Battlefield } from '../battlefield/battlefield.js';
import { Controls } from '../controls/controls.js';
import { Footer } from '../footer/footer.js';
import { Header } from '../header/header.js';

export function App(game) {
	const app = document.createElement('div');
	app.className = 'app';

	const header = Header(game);
	const battlefield = Battlefield(game);
	const controls = Controls(game);
	const footer = Footer();

	app.appendChild(header);
	app.appendChild(battlefield);
	app.appendChild(controls);
	app.appendChild(footer);

	return app;
}
