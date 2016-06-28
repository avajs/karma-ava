import test from 'ava'; // eslint-disable-line ava/no-ignored-test-files

test('foo', t => {
	t.is(1, 1);
});

test('bar', t => {
	var a = {foo: 'foo'};
	var b = {bar: 'bar'};
	t.is(a.foo, b.bar);
});

