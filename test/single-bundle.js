'use strict'

const test = require('tap').test
const reduce = require('..')
const path = require('path')
const del = require('del')
const compare = require('compare-directory')
const depsify = require('depsify')

const fixtures = path.resolve.bind(path, __dirname, 'fixtures')
const dest = fixtures.bind(null, 'build', 'single-bundle')
const expect = fixtures.bind(null, 'expected', 'single-bundle')

test('single bundle', function(t) {
  let basedir = fixtures('src')
  let b = depsify({
    basedir,
    processor: [
      require('postcss-simple-import')(),
      require('postcss-custom-url'),
      require('postcss-advanced-variables')(),
    ],
  })
  del(dest()).then(function () {
    reduce.src('*.css', { cwd: basedir })
      .pipe(reduce.bundle(b, 'common.css'))
      .pipe(reduce.dest(dest(), null, {
        maxSize: 0,
        assetOutFolder: fixtures('build', 'single-bundle', 'images'),
      }))
      .on('data', () => {})
      .on('end', function () {
        compare(t, ['**/*.css', '**/*.png'], dest(), expect())
        t.end()
      })
  })
})

