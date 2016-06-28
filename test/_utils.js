var path = require('path');

var slice = Array.prototype.slice;

module.exports.fixture = function () {
	var args = slice.call(arguments);
	args.unshift(__dirname, 'fixtures');

	return path.resolve.apply(path, args);
};
