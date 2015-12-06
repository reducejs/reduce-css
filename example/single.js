var path = require('path')
var del = require('del')
var reduce = require('..')
var reducePostcss = require('reduce-css-postcss')

var fixtures = path.resolve.bind(path, __dirname)
var build = fixtures('build')

del(build)
  .then(function () {
    return reduce.run([function () {
      return reduce
        .on('instance', function (b) {
          b.plugin(reducePostcss)
        })
        .src('*.css', { basedir: fixtures('src'), factor: 'common.css' })
        .pipe(reduce.dest(build, null, {
          maxSize: 0,
          assetOutFolder: fixtures('build', 'images'),
        }))
    }])
  })
  .then(function () {
    console.log('DONE!')
  })

