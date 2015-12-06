var test = require('tap').test
var reduce = require('..')
var path = require('path')
var del = require('del')
var compare = require('compare-directory')

var fixtures = path.resolve.bind(path, __dirname, 'fixtures')
var dest = fixtures.bind(null, 'build', 'single-bundle')
var expect = fixtures.bind(null, 'expected', 'single-bundle')

test('single bundle', function(t) {
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
        factor: 'common.css',
      })
      .pipe(reduce.dest(dest(), null, {
        maxSize: 0,
        assetOutFolder: fixtures('build', 'single-bundle', 'images'),
      }))
    },

    function () {
      compare(t, ['**/*.css', '**/*.png'], dest(), expect())
    },
  ])
})

