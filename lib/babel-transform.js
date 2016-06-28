'use strict';
var stream = require('stream');
var util = require('util');
var babel = require('babel-core');
var babelConfigBuilder = require('ava/lib/babel-config');

function makeTransform(opts) {
	var babelConfig = babelConfigBuilder.validate(opts.babel);

	return function (filename) {
		if (opts.file !== filename) {
			return new stream.PassThrough();
		}

		return new Babelify(filename, babelConfig);
	};
}

module.exports = makeTransform;

// copied from Babelify - modified so we can embed source maps
function Babelify(filename, babelConfig) {
	stream.Transform.call(this);
	this._data = '';
	this._filename = filename;
	this._babelConfig = babelConfig;
}

util.inherits(Babelify, stream.Transform);

Babelify.prototype._transform = function (buf, enc, callback) {
	this._data += buf;
	callback();
};

Babelify.prototype._flush = function (callback) {
	try {
		var babelOpts = babelConfigBuilder.build(this._babelConfig, this._filename, this._data);
		babelOpts.sourceMaps = 'inline';
		var result = babel.transform(this._data, babelOpts);
		this.emit('babelify', result, this._filename);
		var code = result.code;
		this.push(code);
	} catch (err) {
		this.emit('error', err);
		return;
	}
	callback();
};
