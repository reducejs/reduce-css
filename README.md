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
Check the [example](example/reduce/).

```js
var reduce = require('reduce-css')
var del = require('del')
var path = require('path')
var Transform = require('stream').Transform

var basedir = path.join(__dirname, 'src')

bundle(createBundler())

function createBundler(watch) {
  var basedir = path.join(__dirname, 'src')
  var b = reduce.create(
    /* glob for entries */
    '*.css',

    /* options for depsify */
    {
      basedir,
      cache: {},
      packageCache: {},
    },

    /* options for common-bundle */
    // single bundle
    // 'bundle.css',
    // multiple bundles
    {
      groups: '*.css',
      common: 'common.css',
    },

    /* options for watchify2 */
    watch && { entryGlob: '*.css' }
  )
  return b
}

function bundle(b) {
  var build = path.join(__dirname, 'build')
  del.sync(build)
  return b.bundle().on('error', log)
    .pipe(b.dest(build, {
      maxSize: 0,
      name: '[name].[hash]',
      assetOutFolder: path.join(build, 'assets'),
    }))
}

function log() {
  console.log.apply(console, [].map.call(arguments, function (msg) {
    if (typeof msg === 'string') {
      return msg
    }
    return JSON.stringify(msg, null, 2)
  }))
}


```

To watch file changes:

```js
var b = createBundler(true)
b.on('update', function update() {
  bundle(b)
  return update
}())

```

To work with gulp:

```js
var gulp = require('gulp')
gulp.task('build', function () {
  return bundle(createBundler())
})

gulp.task('watch', function (cb) {
  var b = createBundler(true)
  b.on('update', function update() {
    bundle(b)
    return update
  }())
  b.on('close', cb)
})

```

## API

```js
var reduce = require('reduce-css')
var b = reduce.create(entries, depsifyOptions, bundleOptions, watchifyOptions)

```

### reduce.create(entries, depsifyOptions, bundleOptions, watchifyOptions)
Return a [`depsify`] instance.

* `entries`: patterns to locate input files. Check [`globby`] for more details.
* `depsifyOptions`: options for [`depsify`].
If `depsifyOptions.postcss` is not `false`,
the plugin [`reduce-css-postcss`] for [`depsify`]
is applied, which use [`postcss`] to preprocess css.
* `bundleOptions`: options for [`common-bundle`].
* `watchifyOptions`: options for [`watchify2`].
If specified, file changes are watched.

### b.bundle()
Return a [`vinyl`] stream,
which can be processed by gulp plugins.

```js
b.bundle().pipe(require('gulp-uglifycss')()).pipe(b.dest('build'))

```

### b.dest(outFolder, urlTransformOptions)
Works almost the same with [`gulp.dest`],
except that file contents are transformed using [`postcss-custom-url`]
before being written to disk.

`urlTransformOptions` is passed to both
the [inline](https://github.com/reducejs/postcss-custom-url#inline)
and [copy](https://github.com/reducejs/postcss-custom-url#copy)
transformers for [`postcss-custom-url`].

The actual processor:
```js
var url = require('postcss-custom-url')
var postcss = require('postcss')
var urlProcessor = postcss(url([
  [ url.util.inline, urlTransformOptions ],
  [ url.util.copy, urlTransformOptions ],
]))

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
[`vinyl`]: https://github.com/gulpjs/vinyl
[`vinyl-fs#src`]: https://github.com/gulpjs/vinyl-fs#srcglobs-options
[`gulp.dest`]: https://github.com/gulpjs/vinyl-fs#destfolder-options
[`globby`]: https://github.com/sindresorhus/globby
