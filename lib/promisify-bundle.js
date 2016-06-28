'use strict';
var Promise = require('bluebird');
var pify = require('pify');

module.exports = function (bundler) {
	var promise = pify(bundler.bundle.bind(bundler), Promise)();
	promise.on = bundler.on.bind(bundler);
	return promise;
};
