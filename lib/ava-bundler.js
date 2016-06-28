'use strict';
var browserify = require('browserify');
var resolveFrom = require('resolve-from');
var replaceTransform = require('./replace-transform');

module.exports = function (cwd, debug, browserAdapterPath) {
	var avaBundler = browserify({debug: debug, basedir: cwd});
	var processAdapterPath = resolveFrom(cwd, 'ava/lib/process-adapter');

	avaBundler.require('ava/lib/process-adapter', {expose: 'ava/lib/process-adapter'});
	avaBundler.require('ava');

	avaBundler.transform(replaceTransform(processAdapterPath, browserAdapterPath), {global: true});

	return avaBundler;
};
