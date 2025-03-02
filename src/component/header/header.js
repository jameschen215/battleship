import './header.css';
import logoImage from '../../image/logo.png';

export function Header() {
	const header = document.createElement('header');
	header.className = 'header';

	// Brand
	const brand = document.createElement('div');
	brand.className = 'brand';

	const logo = document.createElement('div');
	logo.className = 'logo';

	const logoImg = document.createElement('img');
	logoImg.src = logoImage;
	logoImg.alt = 'Logo';
	logo.appendChild(logoImg);

	const brandTitle = document.createElement('span');
	brandTitle.className = 'brand-title';
	brandTitle.textContent = 'Battleship';
	brand.appendChild(logo);
	brand.appendChild(brandTitle);
	header.appendChild(brand);

	// Game info
	const gameInfo = document.createElement('div');
	gameInfo.className = 'game-info';

	const message = document.createElement('div');
	message.className = 'message';
	message.textContent = 'Place the ships.';

	gameInfo.appendChild(message);
	header.appendChild(gameInfo);

	// Fill empty to make game info center
	const empty = document.createElement('div');
	empty.className = 'fill-empty';
	header.appendChild(empty);

	return header;
}
