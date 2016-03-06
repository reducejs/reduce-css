'use strict'

const reduce = require('reduce-css')
const gulp = require('gulp')
const del = require('del')
const path = require('path')
const build = path.join(__dirname, 'build')

gulp.task('clean', function () {
  return del(build)
})

gulp.task('build', ['clean'], function () {
  let basedir = path.join(__dirname, 'src')
  let b = reduce.create({
    basedir,
    resolve: {
      paths: [path.join(__dirname, 'src', 'web_modules')],
    },
  })
  return reduce.src('page/**/index.css', { cwd: basedir })
    .pipe(reduce.bundle(b, 'bundle.css'))
    .pipe(reduce.dest(build, null, {
      maxSize: 0,
      name: '[name].[hash]',
      assetOutFolder: path.join(build, 'assets'),
    }))
})

gulp.task('watch', ['clean'], function () {
  let basedir = path.join(__dirname, 'src')
  let b = reduce.create({
    basedir,
    resolve: {
      paths: [path.join(__dirname, 'src', 'web_modules')],
    },
  })
  let count = 1
  return gulp.src('page/**/index.css', { cwd: basedir })
    .pipe(reduce.watch(b, 'bundle.css', { entryGlob: 'page/**/index.css' }))
    .on('bundle', function (bundleStream) {
      bundleStream.pipe(reduce.dest(build, null, {
        maxSize: 0,
        name: '[name].[hash]',
        assetOutFolder: path.join(build, 'assets'),
      }))
      .on('data', file => console.log('bundle:', file.relative))
      .once('end', function () {
        console.log('-'.repeat(40), cout++ + '')
        if (count > 3) {
          b.close()
        }
      })
    })
})

