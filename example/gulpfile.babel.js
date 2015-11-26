import gulp from 'gulp'
import path from 'path'
import postcss from 'postcss'
import del from 'del'
import reduce from '../lib/main'
import reducePostcss from 'reduce-css-postcss'

var fixtures = path.resolve.bind(path, __dirname)

gulp.task('clean', function () {
  return del(fixtures('build'))
})

gulp.task('multiple-bundles', ['clean'], function () {
  return reduce
    .on('error', console.log.bind(console))
    .on('log', console.log.bind(console))
    .on('instance', function (b) {
      b.plugin(reducePostcss)
    })
    .src('*.css', {
      basedir: fixtures('src'),
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

gulp.task('watch-multiple-bundles', ['clean'], function (cb) {
  return reduce.watch()
    .on('close', cb)
    .on('error', console.log.bind(console))
    .on('log', console.log.bind(console))
    .on('instance', function (b) {
      b.plugin(reducePostcss)
    })
    .src('*.css', {
      basedir: fixtures('src'),
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

gulp.task('watch-single-bundle', ['clean'], function (cb) {
  reduce.watch()
    .on('close', cb)
    .on('error', console.log.bind(console))
    .on('log', console.log.bind(console))
    .on('instance', function (b) {
      b.plugin(reducePostcss)
    })
    .src('*.css', {
      basedir: fixtures('src'),
      factor: 'common.css',
    })
    .pipe(reduce.dest, 'build', null, {
      maxSize: 0,
      assetOutFolder: fixtures('build', 'images'),
    })
})

gulp.task('single-bundle', ['clean'], function () {
  return reduce
    .on('error', console.log.bind(console))
    .on('log', console.log.bind(console))
    .on('instance', function (b) {
      b.plugin(reducePostcss)
    })
    .src('*.css', {
      basedir: fixtures('src'),
      factor: 'common.css',
    })
    .pipe(reduce.dest('build', null, {
      maxSize: 0,
      assetOutFolder: fixtures('build', 'images'),
    }))
})

gulp.task('default', ['multiple-bundles'])

