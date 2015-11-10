# reduce-css
Pack CSS into multiple bundles,
based on [depsify](https://github.com/zoubin/depsify)
and [factor-vinylify](https://www.npmjs.com/package/factor-vinylify).

[![npm](https://nodei.co/npm/reduce-css.png?downloads=true)](https://www.npmjs.org/package/reduce-css)

[![version](https://img.shields.io/npm/v/reduce-css.svg)](https://www.npmjs.org/package/reduce-css)
[![status](https://travis-ci.org/zoubin/reduce-css.svg?branch=master)](https://travis-ci.org/zoubin/reduce-css)
[![coverage](https://img.shields.io/coveralls/zoubin/reduce-css.svg)](https://coveralls.io/github/zoubin/reduce-css)
[![dependencies](https://david-dm.org/zoubin/reduce-css.svg)](https://david-dm.org/zoubin/reduce-css)
[![devDependencies](https://david-dm.org/zoubin/reduce-css/dev-status.svg)](https://david-dm.org/zoubin/reduce-css#info=devDependencies)

It generates a [vinyl](https://www.npmjs.com/package/vinyl) stream,
which can be transformed by [gulp](https://www.npmjs.com/package/gulp) plugins.

## Examples

See the files in the `example` directory.

```javascript
import gulp from 'gulp'
import path from 'path'
import postcss from 'postcss'
import del from 'del'
import reduce from '../lib/main'

var processor = postcss([
  require('postcss-import')(),
  require('postcss-custom-url'),
  require('postcss-advanced-variables')(),
])

var fixtures = path.resolve.bind(path, __dirname)

gulp.task('clean', function () {
  return del(fixtures('build'))
})

gulp.task('multiple-bundles', ['clean'], function () {
  return reduce
    .on('error', console.log.bind(console))
    .on('log', console.log.bind(console))
    .src('*.css', {
      basedir: fixtures('src'),
      processor: function (result) {
        return processor.process(result.css, { from: result.from, to: result.from })
        .then(function (res) {
          result.css = res.css
        })
      },
      factor: {
        needFactor: true,
        common: 'common.css',
      },
    })
    .pipe(reduce.dest('build', null, {
      maxSize: 0,
      useHash: true,
      assetOutFolder: fixtures('build', 'images'),
    }))
})

gulp.task('watch-multiple-bundles', ['clean'], function () {
  return reduce.watch()
    .on('error', console.log.bind(console))
    .on('log', console.log.bind(console))
    .src('*.css', {
      basedir: fixtures('src'),
      processor: function (result) {
        return processor.process(result.css, { from: result.from, to: result.from })
        .then(function (res) {
          result.css = res.css
        })
      },
      factor: {
        needFactor: true,
        common: 'common.css',
      },
    })
    .pipe(reduce.dest, 'build', null, {
      maxSize: 0,
      useHash: true,
      assetOutFolder: fixtures('build', 'images'),
    })
})

```

## API

### reduce.src(patterns, bopts)

Creates a vinyl file stream to flow all the bundle file objects,
which can be transformed by gulp plugins.

#### patterns

Type: `String`, `Array`

Used by [globby](https://github.com/sindresorhus/globby) to locate entries.

#### bopts

Options to create the depsify instance.

Fields not explained in the following sections
are the same with those in [depsify](https://github.com/zoubin/depsify)

#### basedir

Type: `String`

Default: `process.cwd()`

Used as the `cwd` field of the options passed to globby.

#### factor

Type: `Object`

Options passed to [factor-vinylify](https://github.com/zoubin/factor-vinylify#options).

### r = reduce.Reduce()
Create a new reduce instance.

### w = reduce.watch(watchifyOpts)

Creates a watch instance.

`watchifyOpts` will be passed to [watchify](https://github.com/substack/watchify).

#### w.src(pattern, opts)

The same with `reduce.src`.

#### w.pipe(fn, arg1, arg2,...)

Like [lazypipe](https://github.com/OverZealous/lazypipe).
Just pass the stream constructor and its arguments to `.pipe`,
and they will be called to create a pipeline
for transforming the output stream.


### reduce.dest(outFolder, opts, urlOpts)

The first two arguments are passed to [vfs.dest](https://github.com/gulpjs/vinyl-fs#destfolder-opt)

`urlOpts`:

Three fields to control the url transformation

* `maxSize`: see [postcss-custom-url](https://github.com/zoubin/postcss-custom-url#maxsize)
* `useHash`, `assetOutFolder`: see [postcss-custom-url](https://github.com/zoubin/postcss-custom-url#copy)


## reduce.lazypipe

The same with [lazypipe](https://github.com/OverZealous/lazypipe)

## reduce.run

The same with [callback-sequence#run](https://github.com/zoubin/callback-sequence#sequenceruncallbacks-done)

## Watch

`reduce.src` generates a vinyl stream,
which could be transformed by gulp-plugins.

However, `reduce.watch().src` generates a [lazypipe](https://github.com/OverZealous/lazypipe) instance,
and will bundle in the next tick.

See the [example](#example)

## Related

* [reduce-js](https://github.com/zoubin/reduce-js)

