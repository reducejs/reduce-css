'use strict'

const test = require('tap').test
const reduce = require('..')
const path = require('path')
const del = require('del')
const compare = require('compare-directory')

const fixtures = path.resolve.bind(path, __dirname, 'fixtures')
const dest = fixtures.bind(null, 'build', 'multiple-bundles')
const expect = fixtures.bind(null, 'expected', 'multiple-bundles')

test('multiple bundles', function(t) {
  let basedir = fixtures('src')
  let b = reduce.create({ basedir })
  del(dest()).then(function () {
    reduce.src('*.css', { cwd: basedir })
      .pipe(reduce.bundle(b, {
        groups: '+(a|b).css',
        common: 'common.css',
      }))
      .pipe(reduce.dest(dest(), null, {
        maxSize: 0,
        useHash: true,
        assetOutFolder: fixtures('build', 'multiple-bundles', 'images'),
      }))
      .on('data', () => {})
      .on('end', function () {
        compare(t, ['**/*.css', '**/*.png'], dest(), expect())
        t.end()
      })
  })
})

