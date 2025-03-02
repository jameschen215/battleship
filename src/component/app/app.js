import { Battlefield } from '../battlefield/battlefield.js';
import { Controls } from '../controls/controls.js';
import { Footer } from '../footer/footer.js';
import { Header } from '../header/header.js';

export function App(game) {
	const header = Header();
	const battlefield = Battlefield(game);
	const controls = Controls();
	const footer = Footer();

	return [header, battlefield, controls, footer];
}
