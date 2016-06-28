'use strict';
var path = require('path');
var browserify = require('browserify');
var externalizeBundle = require('./externalize-bundle');
var getBundlePromise = require('./promisify-bundle');
var babelTransform = require('./babel-transform');
var makeAvaBundler = require('./ava-bundler');

function bundlerFactory(cwd) {
	var browserAdapterPath = path.join(__dirname, 'browser-adapter.js');
	var avaBundler = makeAvaBundler(cwd, true, browserAdapterPath);

	var externalizeAva = externalizeBundle(avaBundler);
	var avaP = getBundlePromise(avaBundler);

	function bundleFile(file, src) {
		return avaP.then(function () {
			var fileCache = {};

			if (src) {
				fileCache[file] = src;
			}

			var bundler = browserify({debug: true, basedir: cwd, fileCache: fileCache});

			bundler.transform(babelTransform({
				cwd: cwd,
				file: file
			}));

			externalizeAva(bundler);

			bundler.require(file, {expose: 'test-file', basedir: cwd});

			return getBundlePromise(bundler);
		});
	}

	return {
		ava: avaP,
		bundleFile: bundleFile
	};
}

bundlerFactory.$inject = ['config.basePath'];

module.exports = bundlerFactory;
