'use strict'

const test = require('tap').test
const reduce = require('..')
const path = require('path')
const fixtures = path.resolve.bind(path, __dirname, 'fixtures')
const fs = require('fs')
const del = require('del')
const DEST = fixtures('build', 'common.css')

test('source entries', function(t) {
  let b = reduce.create({
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
    resolve: function (file, parent) {
      return path.resolve(parent.basedir, file)
    },
    dependenciesFilter: function (deps, file) {
      var base = path.basename(file)
      return base === 'a' ? ['/c'] : ['/d']
    },
  })
  del(DEST).then(function () {
    b.plugin(reduce.bundler, 'common.css')
    b.bundle()
      .pipe(reduce.dest(fixtures('build')))
      .on('data', () => {})
      .on('end', function () {
        t.equal(
          fs.readFileSync(DEST, 'utf8'),
          'd{}c{}b{}'
        )
        t.end()
      })
  })
})

