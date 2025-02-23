module.exports = {
	testEnvironment: 'jsdom',
	moduleFileExtensions: ['js'],
	transform: {
		'^.+\\.js$': 'babel-jest',
	},
	moduleNameMapper: {
		'\\.(css|less|scss)$': '<rootDir>/__mocks__/styleMock.js',
		'\\.(png|jpg|svg|gif)$': '<rootDir>/__mocks__/fileMock.js',
	},
};
