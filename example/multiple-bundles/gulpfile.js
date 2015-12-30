var reduce = require('../..')
var gulp = require('gulp')
var gutil = require('gulp-util')
var del = require('del')
var postcss = require('reduce-css-postcss')
var path = require('path')
var build = path.join(__dirname, 'build')

var urlOpts = {
  // Assets with size less than `maxSize` will be inlined.
  maxSize: 0,

  // If `true`, all non-inline assets will be renamed with their sha1 when copied.
  // useHash: true,
  // Specify how to rename (basename without the extension) assets when copied.
  name: '[name].[hash]',

  // Where non-inline assets will be copied.
  assetOutFolder: path.join(build, 'images'),
}

gulp.task('clean', function () {
  return del(build)
})

gulp.task('build', ['clean'], function () {
  return src(reduce)
    // Use `reduce.dest` instead of `gulp.dest` to write the bundles into disk.
    // The first two arguments are passed to `gulp.dest`
    // The third argument specifies how to handle assets.
    // It is passed to the `inline` and `copy` transform.
    // Refer to `https://github.com/zoubin/postcss-custom-url#util` for more information.
    .pipe(reduce.dest(build, null, urlOpts))
})

// To keep `watch` unfinished, declare `cb` as the first argument of the task callback
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

  // Options passed to `custom-resolve` to specify how to resolve css modules.
  // Refer to `https://github.com/zoubin/custom-resolve` for more information.
  var resolveOpts = {
    // Check `style` field in package.json instead of `main`
    main: 'style',

    // Look for files with specified extensions.
    extensions: ['.css'],

    // Resolve symlinks to their real paths.
    symlink: true,

    // Now, we can `@import "helper/color"` anywhere under the `src` directory.
    // Otherwise, we have to write relative paths like `@import "../../web_modules/helper/color"`
    paths: [path.join(__dirname, 'src', 'web_modules')],
  }

  // Refer to `https://github.com/zoubin/reduce-css-postcss` for more information.
  var postcssOpts = {
    processorFilter: function (pipeline) {
      // Specify options passed to `postcss-simple-import`
      // Refer to `https://github.com/zoubin/postcss-simple-import` for more information.
      pipeline.get('postcss-simple-import').push({ resolve: resolveOpts })
    },
  }

  r.once('instance', function (b) {
    b.add(path.join(__dirname, 'src/node_modules/reset/index.css'))
  })

  // The first argument is passed to globby.
  // Refer to `https://github.com/sindresorhus/globby#globbypatterns-options` for more information
  return r.src('page/**/index.css', {
    // Options passed to `common-bundle`
    // Refer to `https://github.com/zoubin/common-bundle` for more information.
    // Name of the output file.
    bundleOptions: {
      // One bundle for each entry detected from `.src()`.
      groups: '**/page/**/index.css',

      // If omitted, no common bundle will be created.
      common: 'common.css',
    },

    basedir: path.join(__dirname, 'src'),

    // Use `@external "reset";` to specify that `reset` must be loaded before the current css module.
    // **Note**:
    // Use `@import "helper/color";` to insert contents into  the current css file.
    atRuleName: 'external',

    plugin: [
      // Apply `reduce-css-postcss`
      // The second element is the options passed to `reduce-css-postcss`
      [postcss, postcssOpts],
    ],

    // Specify how to resolve files.
    resolve: resolveOpts,
  })
}
