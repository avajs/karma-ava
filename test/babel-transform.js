import test from 'ava';
import browserify from 'browserify';

import babelTransform from '../lib/babel-transform';

import {fixture} from './_utils';

test.cb('successfully converts es2015 code', t => {
	var b = browserify();
	b.transform(babelTransform({file: fixture('test', 'es2015.js')}));
	b.external('ava-bundler-external/process-adapter');

	b.add(fixture('test', 'es2015.js'));

	b.bundle(t.end);
});

test.cb('dows not convert if file does not match', t => {
	var b = browserify();
	b.transform(babelTransform({file: fixture('test', 'es2015.js')}));
	b.external('ava-bundler-external/process-adapter');

	b.add(fixture('test', '_es2015.js'));

	b.bundle(function (err) {
		t.truthy(err);
		t.end();
	});
});
