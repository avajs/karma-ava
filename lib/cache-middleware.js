'use strict';
var findCacheDir = require('find-cache-dir');
var express = require('express');

module.exports = function (cacheName, cwd) {
	var cacheDir = findCacheDir({name: cacheName, cwd: cwd});
	return express.static(cacheDir);
};
