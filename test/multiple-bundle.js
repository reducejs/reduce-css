'use strict'

const test = require('tap').test
const reduce = require('..')
const path = require('path')
const del = require('del')
const compare = require('compare-directory')

const fixtures = path.resolve.bind(path, __dirname, 'fixtures')
const build = fixtures('build', 'multiple-bundles')
const expect = fixtures('expected', 'multiple-bundles')

test('multiple bundles', function(t) {
  del(build).then(function () {
    var basedir = fixtures('src')
    var b = reduce.create(
      '*.css',
      { basedir },
      {
        groups: '+(a|b).css',
        common: 'common.css',
      }
    )
    b.bundle().pipe(b.dest(build, {
      maxSize: 0,
      useHash: true,
      assetOutFolder: fixtures('build', 'multiple-bundles', 'images'),
    }))
    .on('end', function () {
      compare(t, ['**/*.css', '**/*.png'], build, expect)
      t.end()
    })
  })
})

