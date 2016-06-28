import fs from 'fs';
import path from 'path';
import test from 'ava';
import resolveFrom from 'resolve-from';
import browserUnpack from 'browser-unpack';
import bundlerFactory from '../lib/test-bundler';
import {fixture} from './_utils';

// If we don't share a de-duped bluebird reference with, it affects the results of some bundles.
// This isn't important for the plugin to work, just for some of the tests in this file.
const avaDir = path.dirname(resolveFrom(__dirname, 'ava'));
const avaBluebird = resolveFrom(avaDir, 'bluebird');
const thisBluebird = resolveFrom(__dirname, 'bluebird');
const sharedBluebird = avaBluebird === thisBluebird;

if (!sharedBluebird) {
	console.warn('No shared bluebird. You aren\'t really testing the full de-dupe behavior of the browserify externals hack.');
}

test('foo bundle does not contain any ava dependencies', async t => {
	const bundler = bundlerFactory(path.join(__dirname, '..'), false);
	const file = await bundler.bundleFile(fixture('test', 'foo'));
	const fileRows = browserUnpack(file);
	t.is(fileRows.length, sharedBluebird ? 2 : 3);
});

test('new bundles can be created after ava bundle is complete', async t => {
	// This goal is a big part of why our bundler has so much code in it.
	// See: https://github.com/substack/node-browserify/pull/1577
	const bundler = bundlerFactory(path.join(__dirname, '..'), false);
	await bundler.ava;
	const file = await bundler.bundleFile(fixture('test', 'foo'));
	const fileRows = browserUnpack(file);
	t.is(fileRows.length, sharedBluebird ? 2 : 3);
});

test('source can be provided to save reading from disk', async t => {
	// This goal is a big part of why our bundler has so much code in it.
	// See: https://github.com/substack/node-browserify/pull/1577
	const bundler = bundlerFactory(path.join(__dirname, '..'), false);
	await bundler.ava;
	const file = await bundler.bundleFile(
		fixture('test', 'has-syntax-errors.js'),
		fs.readFileSync(fixture('test', 'foo.js'), 'utf8')
	);
	const fileRows = browserUnpack(file);
	t.is(fileRows.length, sharedBluebird ? 2 : 3);
});

