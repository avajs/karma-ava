'use strict';
var path = require('path');
var browserify = require('browserify');

var mainPath = path.join(__dirname, 'main.js');

// This is a convenience while things are still under active development.
// TODO: main.js should be built and shipped as part of the publish process
function factory() {
	return function (content, file, done) {
		if (file.originalPath !== mainPath) {
			done(null, content);
			return;
		}

		var fileCache = {};
		fileCache[mainPath] = content;

		var bundler = browserify({debug: true, basedir: __dirname, fileCache: fileCache});
		bundler.add(mainPath, {basedir: __dirname});
		bundler.bundle(done);
	};
}

factory.$inject = [];

module.exports = factory;
