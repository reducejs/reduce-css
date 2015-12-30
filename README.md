# reduce-css
[![version](https://img.shields.io/npm/v/reduce-css.svg)](https://www.npmjs.org/package/reduce-css)
[![status](https://travis-ci.org/zoubin/reduce-css.svg?branch=master)](https://travis-ci.org/zoubin/reduce-css)
[![coverage](https://img.shields.io/coveralls/zoubin/reduce-css.svg)](https://coveralls.io/github/zoubin/reduce-css)
[![dependencies](https://david-dm.org/zoubin/reduce-css.svg)](https://david-dm.org/zoubin/reduce-css)
[![devDependencies](https://david-dm.org/zoubin/reduce-css/dev-status.svg)](https://david-dm.org/zoubin/reduce-css#info=devDependencies)

Pack CSS into common shared bundles.

**Features**:

* Use [`depsify`] to manage css dependencies.
* Accept patterns for detecting entries.
* Use [`watchify`] to update bundles whenever file changes. And new entries can be detected (in progress).
* Use [`common-bundle`] to pack modules by default.
* Easy to work with [`gulp`].

## Example
Check more [examples](example/).

The following example uses [`reduce-css-postcss`] to preprocess css before packing them into bundles.

```javascript
var reduce = require('reduce-css')
var gulp = require('gulp')
var gutil = require('gulp-util')
var del = require('del')
var postcss = require('reduce-css-postcss')
var path = require('path')
var build = path.join(__dirname, 'build')

var urlOpts = {
  maxSize: 0,
  name: '[name].[hash]',
  assetOutFolder: path.join(build, 'images'),
}

gulp.task('clean', function () {
  return del(build)
})

gulp.task('build', ['clean'], function () {
  return src(reduce)
    .pipe(reduce.dest(build, null, urlOpts))
})

gulp.task('watch', ['clean'], function (cb) {
  src(reduce.watch())
    .pipe(reduce.dest, build, null, urlOpts)
})

function src(r) {
  var log = gutil.log.bind(gutil)
  r.on('error', function (err) {
    log(err.stack)
  })
  r.on('log', log)

  var resolveOpts = {
    main: 'style',
    extensions: ['.css'],
    symlink: true,
    paths: [path.join(__dirname, 'src', 'web_modules')],
  }

  var postcssOpts = {
    processorFilter: function (pipeline) {
      pipeline.get('postcss-simple-import').push({ resolve: resolveOpts })
    },
  }

  r.once('instance', function (b) {
    b.add(path.join(__dirname, 'src/node_modules/reset/index.css'))
  })

  return r.src('page/**/index.css', {
    bundleOptions: {
      groups: '**/page/**/index.css',
      common: 'common.css',
    },
    basedir: path.join(__dirname, 'src'),
    atRuleName: 'external',
    plugin: [
      [postcss, postcssOpts],
    ],
    resolve: resolveOpts,
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

### reduce.src(patterns, bopts)
Create a stream flowing [`vinyl`] file objects,
which represents bundles created.

**patterns**

Type: `String`, `Array`

Used by [`globby`] to locate entries.

**bopts**

Options to create the [`depsify`] instance.

Fields not explained in the following sections
are the same with those in [`depsify`].

**bopts.basedir**

Type: `String`

Default: `process.cwd()`

Used as the `cwd` field of the options passed to [`globby`].

**bopts.bundleOptions**

Type: `Object`

Options passed to [`common-bundle`].

### r = reduce.Reduce()
Create a new reduce instance.

### w = reduce.watch(watchifyOpts)
Creates a watch instance.

`watchifyOpts` will be passed to [`watchify`].

`w.src(pattern, opts)`:
The same with `reduce.src`.

`w.pipe(fn, arg1, arg2,...)`: Like [`lazypipe`].
Pass the stream constructor and its arguments to `.pipe`,
and they will be called to create a pipeline
for transforming the output stream.

### reduce.dest(outFolder, opts, urlOpts)
The first two arguments are passed to [`gulp.dest`].

`urlOpts`:

Specify how to make url transformations.

* `maxSize`: [`postcss-custom-url#inline`].
* `useHash`, `assetOutFolder`: [`postcss-custom-url#copy`]

## reduce.lazypipe
The same with [`lazypipe`].

## reduce.run
The same with [`callback-sequence#run`].

## Related

* [`reduce-js`]
* [`reduce-css-postcss`]
* [`depsify`]

[`reduce-js`]: https://github.com/zoubin/reduce-js
[`reduce-css-postcss`]: https://github.com/zoubin/reduce-css-postcss
[`depsify`]: https://github.com/zoubin/depsify
[`common-bundle`]: https://www.npmjs.com/package/common-bundle
[`vinyl`]: https://www.npmjs.com/package/vinyl
[`gulp`]: https://www.npmjs.com/package/gulp
[`globby`]: https://github.com/sindresorhus/globby
[`watchify`]: https://github.com/substack/watchify
[`lazypipe`]: https://github.com/OverZealous/lazypipe
[`gulp.dest`]: https://github.com/gulpjs/gulp/blob/master/docs/API.md#gulpdestpath-options
[`callback-sequence#run`]: https://github.com/zoubin/callback-sequence#sequenceruncallbacks-done
[`postcss-custom-url#inline`]: https://github.com/zoubin/postcss-custom-url#inline
[`postcss-custom-url#copy`]: https://github.com/zoubin/postcss-custom-url#copy
