'use strict';
var path = require('path');
var express = require('express');
var cacheMiddleware = require('./lib/cache-middleware');
var childProcessMiddleware = require('./lib/child-process-middleware');

function createPattern(path) {
	return {
		pattern: path,
		included: true,
		served: true,
		watched: false
	};
}

function framework(config) {
	var mainPath = path.join(__dirname, 'lib', 'main.js');

	config.preprocessors = config.preprocessors || {};

	config.preprocessors[mainPath] = ['ava-main'];

	config.files.forEach(function (file) {
		config.preprocessors[file.pattern] = ['ava'];
	});

	config.files.unshift(
		createPattern(mainPath)
	);

	// This will not work until `karma@1.1.0` - users should manually add `ava` until then.
	config.middleware = config.middleware || [];

	if (config.middleware.indexOf('ava') === -1) {
		config.middleware.push('ava');
	}
}

framework.$inject = ['config'];

function middlewareFactory(cwd) {
	return express()
		.use('/karma-ava/', cacheMiddleware('karma-ava', cwd))
		.use('/karma-ava/child/', childProcessMiddleware);
}

middlewareFactory.$inject = ['config.basedir'];

module.exports = {
	'ava-test-bundler': ['factory', require('./lib/test-bundler')],
	'framework:ava': ['factory', framework],
	'preprocessor:ava': ['factory', require('./lib/preprocessor')],
	'preprocessor:ava-main': ['factory', require('./lib/preprocessor-main')],
	'middleware:ava': ['factory', middlewareFactory]
};
