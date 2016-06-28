module.exports = function (config) {
	config.set({
		frameworks: ['ava'],
		basePath: 'demo',
		files: ['ava-*-test.js'],
		browsers: [
			'Chrome'
		],
		plugins: [
			require('karma-chrome-launcher'),
			require('./')
		],
		singleRun: false,
		autoRun: true
	});
};
