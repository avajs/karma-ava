var Promise = require('bluebird');
var test = require('ava');
var foo = require('../foo');

test(function (t) {
	t.is(foo, 'foo');
});
