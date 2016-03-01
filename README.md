# reduce-css
[![version](https://img.shields.io/npm/v/reduce-css.svg)](https://www.npmjs.org/package/reduce-css)
[![status](https://travis-ci.org/reducejs/reduce-css.svg?branch=master)](https://travis-ci.org/reducejs/reduce-css)
[![coverage](https://img.shields.io/coveralls/reducejs/reduce-css.svg)](https://coveralls.io/github/reducejs/reduce-css)
[![dependencies](https://david-dm.org/reducejs/reduce-css.svg)](https://david-dm.org/reducejs/reduce-css)
[![devDependencies](https://david-dm.org/reducejs/reduce-css/dev-status.svg)](https://david-dm.org/reducejs/reduce-css#info=devDependencies)
![node](https://img.shields.io/node/v/reduce-css.svg)

Pack CSS into common shared bundles.

**Features**:

* Use [`depsify`] to pack css files into bundles.
* Accept patterns to add entries.
* Use [`watchify2`] to watch files, which is able to detect new entries.
* Use [`common-bundle`] to pack modules by default,
  which make `b.bundle()` output a stream manipulatable by [`gulp`] plugins.
  It can be replaced with other plugins like [`factor-bundle`].

- [Example](#example)
- [API](#api)

## Example
The following example uses [`reduce-css-postcss`] to preprocess css before packing them into bundles.

```javascript
const reduce = require('reduce-css')
const gulp = require('gulp')
const del = require('del')
const postcss = require('reduce-css-postcss')
const path = require('path')
const build = path.join(__dirname, 'build')
const depsify = require('depsify')

gulp.task('clean', function () {
  return del(build)
})

gulp.task('build', ['clean'], function () {
  let b = createBundler()
  return gulp.src('page/**/index.css', { cwd: b._options.basedir })
    .pipe(reduce.bundle(b, {
      groups: 'page/**/index.css',
      common: 'common.css',
    }))
    .pipe(transform())
})

gulp.task('watch', ['clean'], function () {
  let b = createBundler()
  b.on('bundle-stream', function (bundleStream) {
    bundleStream.pipe(transform())
  })
  return gulp.src('page/**/index.css', { cwd: b._options.basedir })
    .pipe(reduce.watch(b, {
      groups: 'page/**/index.css',
      common: 'common.css',
    }))
})

function createBundler() {
  let resolveOpts = {
    main: 'style',
    extensions: ['.css'],
    symlink: true,
    paths: [path.join(__dirname, 'src', 'web_modules')],
  }
  let postcssOpts = {
    processorFilter: function (pipeline) {
      pipeline.get('postcss-simple-import').push({
        resolve: resolveOpts,
      })
    },
  }
  let b = depsify({
    entries: ['node_modules/reset/index.css'],
    basedir: path.join(__dirname, 'src'),
    atRuleName: 'external',
    plugin: [
      [postcss, postcssOpts],
    ],
    resolve: resolveOpts,
  })
  b.on('log', err => console.log(err))

  return b
}

function transform() {
  return reduce.dest(build, null, {
    maxSize: 0,
    name: '[name].[hash]',
    assetOutFolder: path.join(build, 'images'),
  })
}


```

**Input**

Directory structure:

```
example/multiple-bundles/src/
├── node_modules
│   └── reset
│       └── index.css
├── page
│   ├── blue
│   │   └── index.css
│   └── red
│       └── index.css
└── web_modules
    ├── component
    │   └── button
    │       ├── button.png
    │       └── index.css
    └── helper
        └── color
            └── index.css

```

page/blue/index.css:

```css
@external "component/button";
@import "helper/color";
.blue {
  color: $blue;
}

```

page/red/index.css:
```css
@external "component/button";
@import "helper/color";
.red {
  color: $red;
}

/* overwrite the default button style */
.button {
  background-color: $green;
}

```

web_modules/component/button/index.css:
```css
@import "helper/color";
.button {
  background-color: $green;
  background-image: url(button.png);
}

```

helper/color/index.css:
```css
$red: #FF0000;
$green: #00FF00;
$blue: #0000FF;

```

node_modules/reset/index.css:
```css
html, body {
  margin: 0;
  padding: 0;
}

```

**Output**

* Two page-specific bundles are created.
* An addtional bundle (`common.css`) is also created to hold modules shared by all pages.
* Assets are moved to the specified location, when urls in css are transformed.

Directory structure:
```
example/multiple-bundles/build/
├── common.css
├── images
│   └── button.161fff2.png
└── page
    ├── blue
    │   └── index.css
    └── red
        └── index.css

```

page/blue/index.css:
```css
.blue {
  color: #0000FF;
}

```

page/red/index.css:
```css
.red {
  color: #FF0000;
}

/* overwrite the default button style */
.button {
  background-color: #00FF00;
}

```

common.css:
```css
html, body {
  margin: 0;
  padding: 0;
}

.button {
  background-color: #00FF00;
  background-image: url(images/button.161fff2.png);
}

```


## API

```javascript
const reduce = require('reduce-css')

```

### reduce.bundle(b, opts)
Return a transform:
* input: [`vinyl-fs#src`]
* output: `b.bundle()`

**b**

[`depsify`] instance.

**opts**

Options passed to `reduce.bundler`.


```javascript
'use strict'

const reduce = require('reduce-css')
const path = require('path')
const depsify = require('depsify')
const basedir = '/path/to/src'
const b = depsify({
  basedir,
  processor: [
    require('postcss-simple-import')(),
    require('postcss-custom-url'),
    require('postcss-advanced-variables')(),
  ],
})
reduce.src('page/**/index.css', { cwd: basedir })
  .pipe(reduce.bundle(b, 'bundle.css'))
  .pipe(reduce.dest('/path/to/build', null, {
    maxSize: 0,
    assetOutFolder: '/path/to/build/images',
  }))
  .on('data', () => {})
  .on('end', function () {
    console.log('done')
  })


```

### reduce.watch(b, opts, watchOpts)
Return a transform:
* input: [`vinyl-fs#src`]
* output: actually no data flows out.

`b` and `opts` are the same with `reduce.bundle(b, opts)`

**watchOpts**

Options passed to [`watchify2`].


```javascript
'use strict'

const reduce = require('reduce-css')
const path = require('path')
const depsify = require('depsify')
const basedir = '/path/to/src'
const b = depsify({
  basedir,
  processor: [
    require('postcss-simple-import')(),
    require('postcss-custom-url'),
    require('postcss-advanced-variables')(),
  ],
})

b.on('bundle-stream', function (bundleStream) {
  // `bundleStream` is the result of `b.bundle()`
  bundleStream.pipe(reduce.dest('/path/to/build', null, {
    maxSize: 0,
    assetOutFolder: '/path/to/build/images',
  }))
  .on('data', () => {})
  .on('end', function () {
    console.log('done')
  })
})

reduce.src('page/**/index.css', { cwd: basedir })
  .pipe(reduce.watch(b, 'bundle.css'))

```

### reduce.src(patterns, opts)
Same with [`vinyl-fs#src`], except that `opts.read` defaults to `false`.

### reduce.dest(outFolder, opts, urlOpts)
`outFolder` and `opts` are passed to [`vinyl-fs#dest`] directly.

[`postcss-custom-url`] is used to transform `url()` expressions in css (paths transformed, assets copied or inlined):
```js
const url = require('postcss-custom-url')
const postcss = require('postcss')
const urlProcessor = postcss(url([
  [ url.util.inline, urlOpts ],
  [ url.util.copy, urlOpts ],
]))

```

### reduce.bundler(b, opts)
The plugin for packing modules.

**opts**

Default: `{}`

* `Function` or `Array`: `b.plugin(opts)` will be executed. Used to replace the default bundler [`common-bundle`].
* `String`: all modules are packed into a single bundle, with `opts` the file path.
* otherwise: `opts` is passed to [`common-bundle`] directly.

```js
const reduce = require('reduce-css')
const path = require('path')
const depsify = require('depsify')

const b = depsify({
  entries: ['a.css', 'b.css'],
  basedir: '/path/to/src',
})
b.plugin(reduce.bundler, 'bundle.css')
b.bundle().pipe(reduce.dest('build'))

```

### reduce.watcher(b, opts)
The plugin for watching file changes, addition and deletion.

`opts` is passed to [`watchify2`] directly.

```js
const reduce = require('reduce-css')
const path = require('path')
const depsify = require('depsify')
const b = depsify({
  entries: ['a.css', 'b.css'],
  basedir: '/path/to/src',
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

[`reduce-js`]: https://github.com/reducejs/reduce-js
[`reduce-css-postcss`]: https://github.com/reducejs/reduce-css-postcss
[`depsify`]: https://github.com/reducejs/depsify
[`common-bundle`]: https://www.npmjs.com/package/common-bundle
[`gulp`]: https://www.npmjs.com/package/gulp
[`watchify2`]: https://github.com/reducejs/watchify2
[`postcss-custom-url`]: https://github.com/reducejs/postcss-custom-url
[`common-bundle`]: https://www.npmjs.com/package/common-bundle
[`vinyl-fs#src`]: https://github.com/gulpjs/vinyl-fs#srcglobs-options
[`vinyl-fs#dest`]: https://github.com/gulpjs/vinyl-fs#destfolder-options
[`factor-bundle`]: https://www.npmjs.com/package/factor-bundle
