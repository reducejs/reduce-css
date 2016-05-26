'use strict'

var Stream = require('stream')
var vfs = require('vinyl-fs')
var PostCSS = require('postcss')
var url = require('postcss-custom-url')
var combine = require('stream-combiner2')
var buffer = require('vinyl-buffer')
var Depsify = require('depsify')
var path = require('path')
var glob = require('globby')
var sink = require('./lib/sink')

function through(write, end) {
  return Stream.Transform({
    objectMode: true,
    transform: write || function (o, enc, next) { next(null, o) },
    flush: end,
  })
}

function bundler(b, opts) {
  var urlProcessor = PostCSS(url)
  b.on('common.pipeline', function (bundleFile, pipeline) {
    var pack = b.pack()
    pack.pop()
    pack.push(
      through(function (row, _, next) {
        urlProcessor.process(row.source, {
          from: row.file,
          to: bundleFile,
        }).then(function (result) {
          next(null, result.css)
        })
      })
    )
    var packPipeline = pipeline.get('pack')
    packPipeline.splice.apply(packPipeline, [0, 1].concat(pack))
  })
  b.plugin(require('common-bundle'), opts)
  b.on('reset', function reset() {
    b.pipeline.push(buffer())
    return reset
  }())
  b.on('bundle', output => {
    output.on('error', err => delete err.stream)
  })
}

function watchify(b, opts) {
  b.plugin(require('watchify2'), opts)
  var close = b.close
  b.close = function () {
    close()
    b.emit('close')
  }
}

function urlify(outFolder, urlOpts) {
  var urlProcessor = PostCSS(url([
    [ url.util.inline, urlOpts ],
    [ url.util.copy, urlOpts ],
  ]))

  return through(function (file, _, next) {
    urlProcessor.process(file.contents.toString('utf8'), {
      from: file.path,
      to: path.resolve(outFolder, file.relative),
    }).then(function (result) {
      file.contents = Buffer(result.css)
      next(null, file)
    }, err => this.emit('error', err))
  })
}

function postcss(b, opts) {
  b.plugin(require('reduce-css-postcss'), {
    processorFilter: function (pipeline) {
      pipeline.get('postcss-simple-import').push({
        resolve: b._options.resolve,
      })

      if (typeof opts === 'function') {
        return opts(pipeline)
      }

      pipeline.push.apply(
        pipeline, [].concat(opts).filter(Boolean)
      )
    },
  })
}

function create(entries, opts, bundleOptions, watchOpts) {
  if (typeof entries !== 'string' && !Array.isArray(entries)) {
    watchOpts = bundleOptions
    bundleOptions = opts
    opts = entries
    entries = null
  }
  opts = opts || {}
  var b = new Depsify(Object.assign({ atRuleName: 'external' }, opts))
  if (opts.postcss !== false) {
    b.plugin(postcss, opts.postcss)
  }
  if (entries) {
    glob.sync(entries, { cwd: b._options.basedir })
      .forEach(function (file) {
        b.add(file)
      })
  }
  b.plugin(bundler, bundleOptions)
  if (watchOpts) {
    b.plugin(watchify, typeof watchOpts === 'object' ? watchOpts : {})
  }
  b.dest = function (outFolder, urlOpts) {
    var output = combine.obj(
      urlify(outFolder, urlOpts),
      vfs.dest(outFolder)
    )
    process.nextTick(sink(output))
    return output
  }
  return b
}

module.exports = {
  bundler,
  watchify,
  urlify,
  create,
}

