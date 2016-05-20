'use strict'

const reduce = require('reduce-css')
const gulp = require('gulp')
const del = require('del')
const path = require('path')
const gutil = require('gulp-util')
const Transform = require('stream').Transform

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

function createBundler(watch) {
  var basedir = path.join(__dirname, 'src')
  var b = reduce.create(
    /* glob for entries */
    'page/**/index.css',

    /* options for depsify */
    {
      basedir,
      resolve: {
        paths: [path.join(__dirname, 'src', 'web_modules')],
      },
      cache: {},
      packageCache: {},
    },

    /* options for common-bundle */
    // single bundle
    // 'bundle.css',
    // multiple bundles
    {
      groups: 'page/**/index.css',
      common: 'common.css',
    },

    /* options for watchify2 */
    watch && { entryGlob: 'page/**/index.css' }
  )
  return b
}

function bundle(b) {
  var startTime = Date.now()
  log('Start bundling')
  var build = path.join(__dirname, 'build')
  del.sync(build)
  return b.bundle().on('error', log)
    .pipe(Transform({
      objectMode: true,
      transform: function (file, enc, next) {
        log('-', file.relative, file.contents.length, 'bytes')
        next(null, file)
      }
    }))
    .pipe(b.dest(build, {
      maxSize: 0,
      name: '[name].[hash]',
      assetOutFolder: path.join(build, 'assets'),
    }))
    .on('end', () => log('End bundling in', Date.now() - startTime, 'ms'))
}

function log() {
  gutil.log.apply(gutil, [].map.call(arguments, function (msg) {
    if (typeof msg === 'string') {
      return msg
    }
    return JSON.stringify(msg, null, 2)
  }))
}

