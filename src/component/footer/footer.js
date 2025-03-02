import './footer.css';

export function Footer() {
	const footer = document.createElement('footer');
	footer.className = 'footer';

	const small = document.createElement('small');
	small.innerHTML = `
    &copy; 2025 Odin Project Assignment by
    <a href="https://github.com/JamesChan" target="_blank">James Chen</a>.
    All rights reserved.
  `;

	footer.appendChild(small);
	return footer;
}
