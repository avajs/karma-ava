'use strict';
var fs = require('fs');
var path = require('path');
var pify = require('pify');
var Promise = require('bluebird');
var findCacheDir = require('find-cache-dir');
var md5hex = require('md5-hex');
var figures = require('figures');
var prefixTitle = require('ava/lib/prefix-title');

var fsP = pify(fs, Promise);
var separator = ' ' + figures.pointerSmall + ' ';

var api = ['config.basePath', 'ava-test-bundler'];
function preprocessorFactory(cwd, bundler) {
	var cacheDir = findCacheDir({
		name: 'karma-ava',
		cwd: cwd,
		create: true,
		thunk: true
	});

	function hashAndCache(bundleSource) {
		var hash = md5hex(bundleSource);
		return fsP.writeFile(cacheDir(hash + '.js'), bundleSource).thenReturn(hash);
	}

	var ava = bundler.ava.then(hashAndCache);

	return function avaPreprocessor(content, file, done) {
		var prefix = prefixTitle(file.originalPath, cwd + path.sep, separator);

		ava.then(function (avaHash) {
			bundler.bundleFile(file.originalPath, content)
				.then(bundler.appendRequire)
				.then(hashAndCache)
				.then(function (fileHash) {
					return 'window.__AVA__.addFile("' + avaHash + '", "' + fileHash + '", "' + prefix + '");\n';
				})
				.nodeify(done);
		});
	};
}

preprocessorFactory.$inject = api;

module.exports = preprocessorFactory;
