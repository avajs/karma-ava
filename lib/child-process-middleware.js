'use strict';
var express = require('express');

function middleware(req, res) {
	res.set('Content-Type', 'text/html');
	res.send([
		'<html>',
		'  <body>',
		'    <script src="/karma-ava/' + req.params.hash1 + '.js"></script>',
		'    <script src="/karma-ava/' + req.params.hash2 + '.js"></script>',
		'    <script>',
		'      require("ava/lib/process-adapter");',
		'    </script>',
		'  </body>',
		'<html>'
	].join('\n'));
}

module.exports = express().get('/:hash1/:hash2', middleware);
