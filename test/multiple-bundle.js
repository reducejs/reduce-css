var test = require('tap').test
var reduce = require('..')
var path = require('path')
var del = require('del')
var compare = require('compare-directory')

var fixtures = path.resolve.bind(path, __dirname, 'fixtures')
var dest = fixtures.bind(null, 'build', 'multiple-bundles')
var expect = fixtures.bind(null, 'expected', 'multiple-bundles')

test('multiple bundles', function(t) {
  return reduce.run([
    function () {
      return del(dest())
    },

    function () {
      return reduce.src('*.css', {
        basedir: fixtures('src'),
        processor: [
          require('postcss-import')(),
          require('postcss-custom-url'),
          require('postcss-advanced-variables')(),
        ],
        factor: {
          needFactor: true,
          common: 'common.css',
        },
      })
      .pipe(reduce.dest(dest(), null, {
        maxSize: 0,
        useHash: true,
        assetOutFolder: fixtures('build', 'multiple-bundles', 'images'),
      }))
    },

    function () {
      compare(t, ['**/*.css', '**/*.png'], dest(), expect())
    },
  ])
})

