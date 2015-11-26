var depsify = require('depsify')
var glob = require('globby')
var unpick = require('util-mix/unpick')
var thr = require('through2')
var postcss = require('postcss')
var url = require('postcss-custom-url')
var factor = require('factor-vinylify')

var urlProcessor = postcss(url)

module.exports = function (pattern, opts) {
  opts = opts || {}
  var bopts = unpick(['factor'], opts)
  bopts.basedir = bopts.basedir || process.cwd()

  var entries = glob.sync(pattern, { cwd: bopts.basedir })
  var b = depsify(entries, bopts)

  b.plugin(factor, opts.factor)

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

