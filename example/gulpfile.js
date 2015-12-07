var gulp = require('gulp')
var del = require('del')
var reduce = require('..')
var postcss = require('reduce-css-postcss')
var path = require('path')
var fixtures = path.resolve.bind(path, __dirname)
var build = fixtures('build')

gulp.task('clean', function () {
  return del(build)
})

gulp.task('single', ['clean'], function () {
  return reduce
    .on('error', console.log.bind(console))
    .on('log', console.log.bind(console))
    .on('instance', function (b) {
      b.plugin(postcss)
    })
    .src('*.css', {
      basedir: fixtures('src'),
      factor: 'common.css',
    })
    .pipe(reduce.dest(build, null, {
      maxSize: 0,
      assetOutFolder: fixtures(build, 'images'),
    }))
})

gulp.task('watch-single', ['clean'], function () {
  reduce.watch()
    .on('done', function () {
      console.log('New bundles created!')
    })
    .on('error', console.log.bind(console))
    .on('log', console.log.bind(console))
    .on('instance', function (b) {
      b.plugin(postcss)
    })
    .src('*.css', {
      basedir: fixtures('src'),
      factor: 'common.css',
    })
    .pipe(reduce.dest, build, null, {
      maxSize: 0,
      assetOutFolder: fixtures(build, 'images'),
    })
})

gulp.task('multi', ['clean'], function () {
  return reduce
    .on('error', console.log.bind(console))
    .on('log', console.log.bind(console))
    .on('instance', function (b) {
      b.plugin(postcss)
    })
    .src('*.css', {
      basedir: fixtures('src'),
      factor: {
        needFactor: true,
        common: 'common.css',
      },
    })
    .pipe(reduce.dest(build, null, {
      maxSize: 0,
      useHash: true,
      assetOutFolder: fixtures(build, 'images'),
    }))
})

gulp.task('watch-multi', ['clean'], function () {
  reduce.watch()
    .on('done', function () {
      console.log('New bundles created!')
    })
    .on('error', console.log.bind(console))
    .on('log', console.log.bind(console))
    .on('instance', function (b) {
      b.plugin(postcss)
    })
    .src('*.css', {
      basedir: fixtures('src'),
      factor: {
        needFactor: true,
        common: 'common.css',
      },
    })
    .pipe(reduce.dest, build, null, {
      maxSize: 0,
      useHash: true,
      assetOutFolder: fixtures(build, 'images'),
    })
})

