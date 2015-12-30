var dest = require('vinyl-fs').dest
var thr = require('through2')
var File = require('vinyl')
var combine = require('stream-combiner2')
var postcss = require('postcss')
var url = require('postcss-custom-url')
var buffer = require('vinyl-buffer')

module.exports = function (outFolder, outOpts, urlOpts) {
  var files = []
  var emptyFiles = []
  var urlProcessor = createProcessor(urlOpts || {})
  return combine.obj(
    buffer(),
    thr.obj(function (file, _, next) {
      files.push(file)
      var f = copyWithoutContents(file)
      emptyFiles.push(f)
      next(null, f)
    }),
    dest(outFolder, outOpts),
    thr.obj(function (file, _, next) {
      var i = emptyFiles.indexOf(file)
      var writePath = file.path
      file = files[i]
      urlProcessor.process(
        file.contents.toString('utf8'),
        { from: file.path, to: writePath }
      )
      .then(function (result) {
        file.contents = Buffer(result.css)
        next(null, file)
      })
      .catch(this.emit.bind(this, 'error'))
    }),
    dest(outFolder, outOpts)
  )
}

function createProcessor(opts) {
  return postcss(url([
    [ url.util.inline, opts ],
    [ url.util.copy, opts ],
  ]))
}

function copyWithoutContents(file) {
  return new File({
    cwd: file.cwd,
    base: file.base,
    path: file.path,
    contents: null,
  })
}

