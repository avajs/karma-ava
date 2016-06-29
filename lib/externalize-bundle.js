'use strict';
var builtins = require('browserify/lib/builtins');
var browserResolve = require('browser-resolve');

// Adapted from browserify.prototype.external.
// This could be made much simpler with some help from browserify.
// See: https://github.com/substack/node-browserify/pull/1577
module.exports = function (bundler) {
	var externalIds = [];

	bundler.on('label', function (prev, id) {
		externalIds.push(prev);

		if (prev !== id) {
			externalIds.push(id);
		}
	});

	function rewriteIndex(row) {
		Object.keys(row.deps).forEach(function (key) {
			var resolved = browserResolve.sync(key, {
				filename: row.file,
				modules: builtins
			});

			row.deps[key] = resolved;

			if (row.indexDeps) {
				row.indexDeps[key] = resolved;
			}
		});
	}

	return function externalize(otherBundler) {
		externalIds.forEach(function (id) {
			otherBundler._external.push(id);
		});

		otherBundler.on('dep', rewriteIndex);

		return otherBundler;
	};
};
