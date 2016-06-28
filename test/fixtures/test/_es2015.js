import bluebird from 'bluebird';
import test from 'ava';
import foo from '../foo';

test(function (t) {
	t.is(foo, 'foo');
});
