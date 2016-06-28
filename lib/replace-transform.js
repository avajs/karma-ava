'use strict';
var fs = require('fs');
var stream = require('stream');
var pify = require('pify');

// Replace the contents of one file with another.
// Like the browserify `browser` in package.json field, but can be used to replace things inside `node_modules`.
// This should be the first transform in the chain.
module.exports = function (from, to) {
	return function (filename) {
		if (filename !== from) {
			return new stream.PassThrough();
		}

		var transform = new stream.Transform();
		var replacement = pify(fs).readFile(to, 'utf8');

		transform._transform = function (buf, enc, cb) {
			// ignore incoming file
			cb();
		};

		transform._flush = function (cb) {
			replacement.then(function (replacement) {
				transform.push(replacement);
				cb();
			}).catch(cb);
		};

		return transform;
	};
};
