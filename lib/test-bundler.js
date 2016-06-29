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

			var bundler = browserify({debug: true, basedir: cwd, fileCache: fileCache, fullPaths: true});

			bundler.transform(babelTransform({
				cwd: cwd,
				file: file
			}));

			externalizeAva(bundler);

			bundler.require(file, {expose: 'test-file', basedir: cwd});

			return getBundlePromise(bundler);
		});
	}

	var requireCode = ';\nrequire("' + avaBundler.avaProcessAdapterPath + '");';

	function appendRequire(code) {
		return code + requireCode;
	}

	return {
		ava: avaP,
		bundleFile: bundleFile,
		requireCode: requireCode,
		appendRequire: appendRequire
	};
}

bundlerFactory.$inject = ['config.basePath'];

module.exports = bundlerFactory;
