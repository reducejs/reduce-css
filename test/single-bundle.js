import test from 'tape'
import reduce from '../lib/main'
import path from 'path'
import del from 'del'
import postcss from 'postcss'
import compare from './util/compare-directory'

var fixtures = path.resolve.bind(path, __dirname)
var dest = fixtures.bind(null, 'build', 'single-bundle')
var expect = fixtures.bind(null, 'expected', 'single-bundle')
var processor = postcss([
  require('postcss-import')(),
  require('postcss-custom-url'),
  require('postcss-advanced-variables')(),
])

test('single bundle', function(t, cb) {
  reduce.run([
    function () {
      return del(dest())
    },

    function () {
      return reduce
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
        .pipe(reduce.dest(dest(), null, {
          maxSize: 0,
          assetOutFolder: fixtures('build', 'single-bundle', 'images'),
        }))
    },

    function () {
      compare(dest(), expect(), t)
    },
  ], cb)
})

