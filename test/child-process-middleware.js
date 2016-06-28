import test from 'ava';
import request from 'supertest-as-promised';
import childProcessMiddleware from '../lib/child-process-middleware';

async function macro(t, a, b) {
	const res = await request(childProcessMiddleware)
		.get(`/${a}/${b}`);

	t.is(res.status, 200);
	t.true(res.text.indexOf(`src="/karma-ava/${a}.js"`) > 0);
	t.true(res.text.indexOf(`src="/karma-ava/${b}.js"`) > 0);
}

macro.title = name => name;

test(macro, 'foo', 'bar');
test(macro, 'baz', 'quz');
