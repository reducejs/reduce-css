# reduce-css
[![version](https://img.shields.io/npm/v/reduce-css.svg)](https://www.npmjs.org/package/reduce-css)
[![status](https://travis-ci.org/reducejs/reduce-css.svg?branch=master)](https://travis-ci.org/reducejs/reduce-css)
[![coverage](https://img.shields.io/coveralls/reducejs/reduce-css.svg)](https://coveralls.io/github/reducejs/reduce-css)
[![dependencies](https://david-dm.org/reducejs/reduce-css.svg)](https://david-dm.org/reducejs/reduce-css)
[![devDependencies](https://david-dm.org/reducejs/reduce-css/dev-status.svg)](https://david-dm.org/reducejs/reduce-css#info=devDependencies)
![node](https://img.shields.io/node/v/reduce-css.svg)

Pack CSS into common shared bundles.

**Features**:

* Accept patterns to add entries.
* Use [`depsify`] to pack css files into bundles.
* Use [`postcss`] to preprocess css.
* Use [`watchify2`] to watch files, which is able to detect new entries.
* Use [`common-bundle`] to create common shared modules by default,
  which make `b.bundle()` output a stream manipulatable by [`gulp`] plugins.

## Example
Suppose we want to pack css in `/path/to/src` (not including those in its subdirectories) into `/path/to/build/bundle.css`.

There are already `blue.css` and `red.css` in `/path/to/src`, and they both depend upon `/path/to/src/node_modules/reset/index.js`.

**Input**

`blue.css`:
```css
@external "reset";
@import "color";
.blue {
  color: $blue;
}

```

`red.css`:
```css
@external "reset";
@external "./button";
@import "color";
.red {
  color: $red;
}

```

`reset` contains styles to be shared.
We use `@external` to declare that
it should come before `a.css` and `b.css` in the final `bundle.css`.
```css
html, body {
  margin: 0;
  padding: 0;
}

```

The `color` module is installed in `node_modules`,
and will be consumed by [`postcss`] when `@import`ed in css.
```css
$red: #FF0000;
$green: #00FF00;
$blue: #0000FF;

```

`/path/to/src/button` is a button component,
shipped with a background image (`/path/to/src/button/button.png`),
as well as some styles (`/path/to/src/button/index.css`):
```css
@import "color";
.button {
  background-color: $red;
  background-image: url(button.png);
}

```
The image will be inlined or copied to the build directory
after bundling, and the url in css will also be transformed to
reference to it correctly.

**Building script**

```js
'use strict'

const reduce = require('reduce-css')

const build = __dirname + '/build'
const basedir = __dirname + '/src'
const b = reduce.create({ basedir })
reduce.src('*.css', { cwd: basedir })
  .pipe(reduce.bundle(b, 'bundle.css'))
  .pipe(reduce.dest(build, null, {
    maxSize: 0,
    name: '[name].[hash]',
    assetOutFolder: build + '/assets',
  }))

```

**Output**

`/path/to/build/bundle.css`:
```css
html, body {
  margin: 0;
  padding: 0;
}

.blue {
  color: #0000FF;
}

.button {
  background-color: #FF0000;
  background-image: url(assets/button.161fff2.png);
}
.red {
  color: #FF0000;
}

```

The background image has been renamed and copied to `/path/to/build/assets/button.161fff2.png`.

**Watch**

To watch file changes:

```js
'use strict'

const reduce = require('reduce-css')

const build = __dirname + '/build'
const basedir = __dirname + '/src'
const b = reduce.create({
  basedir,
  cache: {},
  packageCache: {},
})

reduce.src('*.css', { cwd: basedir })
  .pipe(reduce.watch(b, 'bundle.css', { entryGlob: '*.css' }))
  .on('bundle', function (bundleStream) {
    bundleStream.pipe(reduce.dest(build, null, {
      maxSize: 0,
      name: '[name].[hash]',
      assetOutFolder: build + '/assets',
    }))
    .on('data', file => console.log('bundle:', file.relative))
    .on('end', () => console.log('-'.repeat(40)))
  })


```

**Common shared bundles**

Check this [example](example/without-gulp/multi.js).

## Work with Gulp
Check this [gulpfile](example/gulp/multi/gulpfile.js).

## API

```javascript
const reduce = require('reduce-css')

```

### reduce.create(opts)
Return a [`depsify`] instance.

`opts` is passed to the [`depsify`] constructor.

If `opts.postcss` is not `false`,
the plugin [`reduce-css-postcss`] for [`depsify`]
is applied, which use [`postcss`] to preprocess css.

### reduce.bundle(b, opts)
Return a transform:
* input: [`vinyl-fs#src`]
* output: `b.bundle()`

**b**

[`depsify`] instance.

**opts**

Options passed to `reduce.bundler`.

### reduce.watch(b, opts, watchOpts)
Return a transform:
* input: [`vinyl-fs#src`].
* output: actually no data flows out,
  but you can listen to the `bundle` event (triggered on the returned transform)
  to process the result of `b.bundle()`.

`b` and `opts` are the same with `reduce.bundle(b, opts)`

**watchOpts**

Options passed to [`watchify2`].

To detect new entries,
provide a glob to detect entries as `watchOpts.entryGlob`.

### reduce.src(patterns, opts)
Same with [`vinyl-fs#src`], except that `opts.read` defaults to `false`.

### reduce.dest(outFolder, opts, urlOpts)
`outFolder` and `opts` are passed to [`vinyl-fs#dest`] directly.

[`postcss-custom-url`] is used to transform `url()` expressions in css (paths transformed, assets copied or inlined).

The actual processor is constructed as:
```js
const url = require('postcss-custom-url')
const postcss = require('postcss')
const urlProcessor = postcss(url([
  [ url.util.inline, urlOpts ],
  [ url.util.copy, urlOpts ],
]))

```

### reduce.bundler(b, opts)
Plugin for creating common shared bundles.

**opts**

Default: `{}`

* `Function` or `Array`: `b.plugin(opts)` will be executed.
  Used to replace the default bundler [`common-bundle`].
* `String`: all modules are packed into a single bundle, with `opts` the file path.
* otherwise: `opts` is passed to [`common-bundle`] directly.

```js
const reduce = require('reduce-css')
const path = require('path')

const b = reduce.create({
  entries: ['a.css', 'b.css'],
  basedir: '/path/to/src',
})
b.plugin(reduce.bundler, 'bundle.css')
b.bundle().pipe(reduce.dest('build'))

```

### reduce.watcher(b, opts)
Plugin for watching file changes, addition and deletion.

`opts` is passed to [`watchify2`] directly.

A `bundle-stream` event is triggered whenever `b.bundle()` is provoked.

```js
const reduce = require('reduce-css')
const path = require('path')
const b = reduce.create({
  entries: ['a.css', 'b.css'],
  basedir: '/path/to/src',
  cache: {},
  packageCache: {},
})
b.plugin(reduce.bundler, 'bundle.css')
b.plugin(reduce.watcher, { entryGlob: '*.css' })
b.on('bundle-stream', function (bundleStream) {
  // bundleStream is the result of `b.bundle()`
  bundleStream.pipe(reduce.dest('build'))
})
b.start()

```

## Related

* [`reduce-js`]
* [`reduce-css-postcss`]
* [`depsify`]

[`postcss`]: https://github.com/postcss/postcss
[`reduce-js`]: https://github.com/reducejs/reduce-js
[`reduce-css-postcss`]: https://github.com/reducejs/reduce-css-postcss
[`depsify`]: https://github.com/reducejs/depsify
[`common-bundle`]: https://www.npmjs.com/package/common-bundle
[`gulp`]: https://www.npmjs.com/package/gulp
[`watchify2`]: https://github.com/reducejs/watchify2
[`postcss-custom-url`]: https://github.com/reducejs/postcss-custom-url
[`vinyl-fs#src`]: https://github.com/gulpjs/vinyl-fs#srcglobs-options
[`vinyl-fs#dest`]: https://github.com/gulpjs/vinyl-fs#destfolder-options
[`factor-bundle`]: https://www.npmjs.com/package/factor-bundle
