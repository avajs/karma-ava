'use strict';
var path = require('path');
var browserify = require('browserify');
var resolveFrom = require('resolve-from');
var externalizeBundle = require('./externalize-bundle');
var getBundlePromise = require('./promisify-bundle');
var babelTransform = require('./babel-transform');
var replaceTransform = require('./replace-transform');

function bundlerFactory(cwd) {
	var avaBundler = browserify({debug: true, basedir: cwd});
	var processAdapterPath = resolveFrom(cwd, 'ava/lib/process-adapter');
	var browserAdapterPath = path.join(__dirname, 'browser-adapter.js');

	[
		'ava/lib/process-adapter',
		'ava/lib/globals',
		'ava/lib/test-worker',
		'ava'
	].forEach(function (val) {
		var isArray = Array.isArray(val);
		var id = isArray ? val[0] : val;
		var expose = isArray ? val[1] : val;
		avaBundler.require(id, {expose: expose, basedir: cwd});
	});

	avaBundler.transform(replaceTransform(processAdapterPath, browserAdapterPath), {global: true});

	var externalizeAva = externalizeBundle(avaBundler);
	var ava = getBundlePromise(avaBundler);

	function bundleFile(file, src) {
		return ava.then(function () {
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
		ava: ava,
		bundleFile: bundleFile
	};
}

bundlerFactory.$inject = ['config.basePath'];

module.exports = bundlerFactory;
