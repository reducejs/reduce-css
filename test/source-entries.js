var test = require('tap').test
var reduce = require('..')
var path = require('path')
var fixtures = path.resolve.bind(path, __dirname, 'fixtures')
var fs = require('fs')
var del = require('del')
var DEST = fixtures('build', 'common.css')

test('source entries', function(t) {
  return reduce.run([
    function () {
      return del(DEST)
    },

    function () {
      return reduce.src({
        entries: [
          {
            file: '/a',
            source: '',
          },
          '/b',
        ],
        fileCache: {
          '/b': 'b{}',
          '/c': 'c{}',
          '/d': 'd{}',
        },
        factor: 'common.css',
        resolve: function (file, parent) {
          return path.resolve(parent.basedir, file)
        },
        dependenciesFilter: function (deps, file) {
          var base = path.basename(file)
          return base === 'a' ? ['/c'] : ['/d']
        },
      })
      .pipe(reduce.dest(fixtures('build')))
    },

    function () {
      t.equal(
        fs.readFileSync(DEST, 'utf8'),
        'd{}c{}b{}'
      )
    },
  ])
})

