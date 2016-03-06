'use strict'

const del = require('del')
const reduce = require('reduce-css')

const build = __dirname + '/build'
const basedir = __dirname + '/src'
const b = reduce.create({ basedir })
b.on('common.map', function (map) {
  console.log('bundles:', Object.keys(map).join(', '))
})
del(build).then(function () {
  reduce.src('*.css', { cwd: basedir })
    .pipe(reduce.bundle(b, {
      groups: '*.css',
      common: 'common.css',
    }))
    .pipe(reduce.dest(build, null, {
      maxSize: 0,
      name: '[name].[hash]',
      assetOutFolder: build + '/assets',
    }))
})

