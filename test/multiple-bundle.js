import test from 'tape'
import reduce from '../lib/main'
import path from 'path'
import del from 'del'
import postcss from 'postcss'
import compare from './util/compare-directory'

var fixtures = path.resolve.bind(path, __dirname)
var dest = fixtures.bind(null, 'build', 'multiple-bundles')
var expect = fixtures.bind(null, 'expected', 'multiple-bundles')
var processor = postcss([
  require('postcss-import')(),
  require('postcss-custom-url'),
  require('postcss-advanced-variables')(),
])

test('multiple bundles', function(t, cb) {
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
      compare(dest(), expect(), t)
    },
  ], cb)
})

