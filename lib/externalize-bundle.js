'use strict';
var through = require('through2');
var objectAssign = require('object-assign');

// Adapted from browserify.prototype.external.
// This could be made much simpler with some help from browserify.
// See: https://github.com/substack/node-browserify/pull/1577
module.exports = function (bundler) {
	var externalIds = [];
	var bdeps = {};
	var blabels = {};

	bundler.on('label', function (prev, id) {
		externalIds.push(prev);
		if (prev !== id) {
			blabels[prev] = id;
			externalIds.push(id);
		}
	});

	bundler.pipeline.get('deps').push(through.obj(function (row, enc, next) {
		bdeps = objectAssign(bdeps, row.deps);
		this.push(row);
		next();
	}));

	function rewriteIndex(row) {
		Object.keys(row.deps).forEach(function (key) {
			var prev = bdeps[key];
			if (prev) {
				var id = blabels[prev];
				if (id) {
					row.indexDeps[key] = id;
				}
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
