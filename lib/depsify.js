var depsify = require('depsify')
var glob = require('globby')
var mix = require('mixy')
var thr = require('through2')
var postcss = require('postcss')
var url = require('postcss-custom-url')
var factor = require('factor-vinylify')

var urlProcessor = postcss(url)

module.exports = function (pattern, opts) {
  if (typeof pattern !== 'string' && !Array.isArray(pattern)) {
    opts = mix({}, pattern, opts)
    pattern = null
  }

  var bopts = mix.exclude('factor', { basedir: process.cwd() }, opts)

  var b
  if (pattern) {
    b = depsify(glob.sync(pattern, { cwd: bopts.basedir }), bopts)
  } else {
    b = depsify(bopts)
  }

  b.plugin(factor, opts && opts.factor)

  // rebase `url()`
  b.on('factor.pipeline', function (file, pipeline) {
    var labeled = pipeline.get('pack')
    var pack = b.pack()
    pack.pop()
    pack.push(thr.obj(function (row, _, next) {
      urlProcessor.process(row.source, { from: row.file, to: file })
        .then(function (result) {
          next(null, result.css)
        })
    }))
    labeled.splice(labeled.length - 1, 1, pack)
  })

  return b
}

