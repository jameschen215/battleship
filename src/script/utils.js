export const range = (size) => Array.from({ length: size }, (_, i) => i);
export const getRandomInt = (min, max) =>
	Math.floor(Math.random() * (max - min + 1)) + min;
