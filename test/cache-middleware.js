import fs from 'fs';
import test from 'ava';
import request from 'supertest-as-promised';
import findCacheDir from 'find-cache-dir';
import pify from 'pify';
import cacheMiddleware from '../lib/cache-middleware';

const fsP = pify(fs);

const time = () => process.hrtime().join('-');

async function macro(t, name) {
	const cacheDir = findCacheDir({name, create: true, thunk: true});

	var filename = time() + '.txt';

	await fsP.writeFile(cacheDir(filename), name);

	const res = await request(cacheMiddleware(name, __dirname))
		.get(`/${filename}`);

	t.is(res.status, 200);
	t.is(res.text, name);
}

macro.title = name => name;

test(macro, 'foo');
test(macro, 'bar');
