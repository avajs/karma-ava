'use strict';
var EventEmitter = require('events').EventEmitter;
var globals = require('ava/lib/globals');

// Chrome gets upset when the `this` value is non-null for these functions.
globals.setTimeout = setTimeout.bind(null);
globals.clearTimeout = clearTimeout.bind(null);

var process = new EventEmitter();

window.addEventListener('message', function (event) {
	if (event.source !== window) {
		event = event.data;
		process.emit(event.name, event.data);
	}
});

// Mock the behavior of a parent process.
process.send = function (name, data) {
	window.postMessage({
		name: 'ava-' + name,
		data: data,
		ava: true
	}, '*');
};

process.env = {};
process.opts = {
	file: 'test-file'
};

process.installSourceMapSupport = function () {};
process.installPrecompilerHook = function () {};
process.installDependencyTracking = function () {};
process.exit = function () {};

module.exports = process;

setTimeout(function () {
	require('ava/lib/test-worker');
});
