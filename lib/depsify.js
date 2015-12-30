var depsify = require('depsify')
var glob = require('globby')
var mix = require('mixy')
var thr = require('through2')
var postcss = require('postcss')
var url = require('postcss-custom-url')
var bundler = require('common-bundle')

var urlProcessor = postcss(url)

module.exports = function (entries, opts) {
  if (typeof entries === 'string' || Array.isArray(entries)) {
    opts = opts || {}
    entries = glob.sync(entries, {
      cwd: opts.basedir || process.cwd(),
    })
  } else {
    opts = entries || {}
    entries = []
  }
  opts.cache = opts.cache || {}
  opts.packageCache = opts.packageCache || {}

  var b = depsify(entries, opts)
  var bundleOptions = opts.bundleOptions || 'bundle.css'
  if (typeof bundleOptions === 'string') {
    bundleOptions = {
      groups: {
        output: bundleOptions,
      },
    }
  }
  bundleOptions = bundleOptions || {}
  bundleOptions.pack = function (options) {
    var pipeline = b.pack()
    pipeline.pop()
    pipeline.push(thr.obj(function (row, _, next) {
      urlProcessor.process(row.source, {
        from: row.file,
        to: options.to,
      }).then(function (result) {
        next(null, result.css)
      })
    }))
    return pipeline
  }

  b.plugin(opts.bundler || bundler, bundleOptions)

  return b
}

