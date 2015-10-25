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

gulp.task('single-bundle', ['clean'], function () {
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
      factor: 'common.css',
    })
    .pipe(reduce.dest('build', null, {
      maxSize: 0,
      assetOutFolder: fixtures('build', 'images'),
    }))
})

gulp.task('default', ['multiple-bundles'])

