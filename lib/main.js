'use strict';
var EventEmitter = require('events').EventEmitter;
var Promise = require('bluebird');

var tests = [];

function addFile(avaHash, fileHash, prefix) {
	var ee = new EventEmitter();

	var iframe = document.createElement('iframe');
	iframe.style.display = 'none';
	iframe.src = '/karma-ava/child/' + avaHash + '/' + fileHash;
	document.body.appendChild(iframe);
	var subWindow = iframe.contentWindow;

	ee.send = function (name, data) {
		subWindow.postMessage({
			name: 'ava-' + name,
			data: data,
			ava: true
		}, '*');
	};

	function listener(event) {
		if (event.source !== subWindow || !event.data.ava) {
			return;
		}

		event = event.data;

		var name = event.name.replace(/^ava\-/, '');

		ee.emit(name, event.data);
	}

	subWindow.addEventListener('message', listener, false);

	var started = false;

	var statsPromise = new Promise(function (resolve) {
		ee.once('stats', resolve);
	});

	var resultsPromise = new Promise(function (resolve) {
		ee.once('results', resolve);
	});

	resultsPromise.then(function () {
		subWindow.removeEventListener('message', listener, false);
		document.body.removeChild(iframe);
	});

	function start(opts) {
		if (started) {
			return;
		}

		started = true;

		statsPromise.then(function () {
			// TODO: Handle default opts in AVA
			ee.send('run', opts || {});
		});
	}

	// TODO: uncaughtExceptions and unhandledRejections
	ee.on('test', function (test) {
		window.__karma__.result({
			id: '',
			description: prefix + test.title,
			suite: [],
			log: [test.error && test.error.message],
			success: !test.error,
			skipped: test.skip || test.todo
		});
	});

	tests.push({
		start: start,
		stats: statsPromise,
		results: resultsPromise
	});
}

window.__AVA__ = {
	addFile: addFile
};

window.__karma__.start = function start() {
	Promise.map(tests, function (test) {
		return test.stats;
	}).then(function (stats) {
		window.__karma__.info({
			total: stats.reduce(function (previous, stats) {
				return previous + stats.testCount;
			}, 0)
		});

		tests.forEach(function (test) {
			test.start();
		});
	});

	Promise.map(tests, function (test) {
		return test.results;
	}).then(function () {
		window.__karma__.complete({});
	});
};
