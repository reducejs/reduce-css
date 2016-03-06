'use strict'

const del = require('del')
const reduce = require('reduce-css')

const build = __dirname + '/build'
const basedir = __dirname + '/src'
const b = reduce.create({ basedir })

del(build).then(function () {
  reduce.src('*.css', { cwd: basedir })
    .pipe(reduce.watch(b, 'bundle.css', { entryGlob: '*.css' }))
    .on('bundle', function (bundleStream) {
      bundleStream.pipe(reduce.dest(build, null, {
        maxSize: 0,
        name: '[name].[hash]',
        assetOutFolder: build + '/assets',
      }))
      .on('data', file => console.log('bundle:', file.relative))
      .on('end', () => console.log('-'.repeat(40)))
    })
})

