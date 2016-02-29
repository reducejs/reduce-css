'use strict'

const reduce = require('../..')
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
  let count = 3
  b.on('bundle-stream', function (bundleStream) {
    --count
    bundleStream.pipe(transform())
      .on('data', () => {})
      .once('end', function () {
        if (count < 0) {
          b.close()
        }
      })
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

