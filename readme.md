# karma-ava [![Build Status](https://travis-ci.org/avajs/karma-ava.svg?branch=master)](https://travis-ci.org/avajs/karma-ava)

> Run [AVA](https://ava.li) tests with [Karma](https://karma-runner.github.io)

*WARNING: Alpha level software - for evaluation use only*


## Install

*Note: this currently requires a custom build of AVA*

```
$ npm install --save-dev jamestalmage/ava#karma-ava karma karma-ava karma-chrome-launcher
```


## Usage

Create a `karma.conf.js`, like so:

```js
module.exports = config => {
	config.set({
		frameworks: ['ava'],
		files: [
			'test/*.js'
		],
		browsers: ['Chrome']
	});
};
```

Then run `karma start`:

```
$ node_modules/.bin/karma start
```


## Notes

- Be careful not to include test helpers in the `files` pattern (future improvements will automatically filter helpers out).


## How it works

1. The `ava` preprocessor (`lib/preprocessor.js`) bundles up a single test. Instead of returning the bundle result. It stores it at `node_modules/.cache/karma-ava/<UNIQUE-HASH>.js`. Karma sees a one-liner function call as the result:

	```js
	window.__AVA__.addFile(AVA_HASH, TEST_HASH, TEST_PREFIX);
	```

	- `AVA_HASH` is the cache key for the external bundle of AVA common to all tests. It just contains AVA and its dependencies.

	- `TEST_HASH` is the cache key for the individual test bundle.

	- `TEST_PREFIX` is a string prefix to put before the test title, something like: `"dirname > filename > "`.

2. The `ava` middleware provides two routes:

	- `/karma-ava/<CACHE_KEY>.js` - returns the the bundle stored for that cache key (could be individual test bundles or the common AVA bundle).

	- `/karma-ava/child/:avaHash/:testHash` - returns an `html` page that simply loads two bundles (the common bundle, and the individual test bundle). These pages will be loaded into `iframes` by the main process.

3. `lib/main.js`

	- This is loaded in the main window by the framework. It provides the `window.__AVA__.addFile()` method discussed above, and acts as a test runner for individual `iframes`. It also communicates test results back to the Karma server in a format it understands.


## TODO

- [ ] Create opinionated, configuration-free defaults that follow AVA's current style.
- [ ] Give the user greater control over what goes in the external/common bundle.
- [ ] Automatically ignore test helpers.
- [ ] Create a custom Karma reporter that uses AVA's own loggers.
- [ ] Honor `ava` config params from `package.json`,
- [ ] Allow for custom `babel` configs,
- [ ] Use `watchify` for faster rebuilds and smart, dependency-based rerun behavior.


## License

MIT © [James Talmage](https://github.com/jamestalmage)
