import test from 'ava';
import browserify from 'browserify';
import pify from 'pify';
import babelTransform from '../lib/babel-transform';
import {fixture} from './_utils';

test('successfully converts es2015 code', async () => {
	const b = browserify();
	b.transform(babelTransform({file: fixture('test', 'es2015.js')}));
	b.external('ava-bundler-external/process-adapter');
	b.add(fixture('test', 'es2015.js'));
	await pify(b.bundle.bind(b), Promise)();
});

test('dows not convert if file does not match', t => {
	const b = browserify();
	b.transform(babelTransform({file: fixture('test', 'es2015.js')}));
	b.external('ava-bundler-external/process-adapter');
	b.add(fixture('test', '_es2015.js'));
	t.throws(pify(b.bundle.bind(b), Promise)());
});
