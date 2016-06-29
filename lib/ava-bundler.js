'use strict';
var browserify = require('browserify');
var resolveFrom = require('resolve-from');
var replaceTransform = require('./replace-transform');

module.exports = function (cwd, debug, browserAdapterPath) {
	var avaBundler = browserify({debug: debug, basedir: cwd, fullPaths: true});
	var processAdapterPath = resolveFrom(cwd, 'ava/lib/process-adapter');
	var avaPath = resolveFrom(cwd, 'ava');
	avaBundler.avaProcessAdapterPath = processAdapterPath;

	avaBundler.require(processAdapterPath);

	avaBundler.require(avaPath);

	avaBundler.transform(replaceTransform(processAdapterPath, browserAdapterPath), {global: true});

	return avaBundler;
};
