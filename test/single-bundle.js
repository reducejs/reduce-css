'use strict'

const test = require('tap').test
const reduce = require('..')
const path = require('path')
const del = require('del')
const compare = require('compare-directory')

const fixtures = path.resolve.bind(path, __dirname, 'fixtures')
const build = fixtures('build', 'single-bundle')
const expect = fixtures('expected', 'single-bundle')

test('single bundle', function(t) {
  del(build).then(function () {
    var basedir = fixtures('src')
    var b = reduce.create(
      '*.css',
      { basedir },
      'common.css'
    )
    b.bundle().pipe(b.dest(build, {
      maxSize: 0,
      assetOutFolder: fixtures('build', 'single-bundle', 'images'),
    }))
    .on('end', function () {
      compare(t, ['**/*.css', '**/*.png'], build, expect)
      t.end()
    })
  })
})

