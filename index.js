'use strict'

const stream = require('stream')
const vfs = require('vinyl-fs')
const postcss = require('postcss')
const url = require('postcss-custom-url')
const File = require('vinyl')
const combine = require('stream-combiner2')
const buffer = require('vinyl-buffer')

function bundler(b, opts) {
  if (typeof opts === 'function' || Array.isArray(opts)) {
    return b.plugin(opts)
  }

  opts = opts || {}
  if (typeof opts === 'string') {
    opts = { groups: { output: opts } }
  }

  let urlProcessor = postcss(url)
  opts.pack = function (options) {
    let pipeline = b.pack()
    pipeline.pop()
    pipeline.push(
      through(function (row, _, next) {
        urlProcessor.process(row.source, {
          from: row.file,
          to: options.to,
        }).then(function (result) {
          next(null, result.css)
        })
      })
    )
    return pipeline
  }
  b.plugin(require('common-bundle'), opts)
}

function through(write, end) {
  return stream.Transform({
    objectMode: true,
    transform: write,
    flush: end,
  })
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

function watcher(b, wopts) {
  b.plugin(require('watchify2'), wopts)
  let close = b.close
  b.close = function () {
    close()
    b.emit('close')
  }
  b.start = function () {
    b.emit('bundle-stream', b.bundle())
  }
  b.on('update', b.start)
}

function bundle(b, opts) {
  b.plugin(bundler, opts)

  return through(
    function (file, enc, next) {
      b.add(file.path)
      next()
    },
    function (next) {
      b.bundle()
        .on('data', data => this.push(data))
        .on('end', next)
        .on('error', err => b.emit('error', err))
    }
  )
}

function watch(b, opts, wopts) {
  b.plugin(bundler, opts)
  b.plugin(watcher, wopts)

  return through(
    function (file, enc, next) {
      b.add(file.path)
      next()
    },
    function (next) {
      b.once('close', next)
      b.start()
    }
  )
}

function src(pattern, opts) {
  opts = opts || {}
  opts.read = false
  return vfs.src(pattern, opts)
}

function dest(outFolder, outOpts, urlOpts) {
  let files = []
  let emptyFiles = []
  let urlProcessor = createProcessor(urlOpts || {})
  return combine.obj(
    buffer(),
    through(function (file, _, next) {
      files.push(file)
      let f = copyWithoutContents(file)
      emptyFiles.push(f)
      next(null, f)
    }),
    vfs.dest(outFolder, outOpts),
    through(function (file, _, next) {
      let i = emptyFiles.indexOf(file)
      let writePath = file.path
      file = files[i]
      urlProcessor.process(
        file.contents.toString('utf8'),
        { from: file.path, to: writePath }
      ).then(function (result) {
        file.contents = Buffer(result.css)
        next(null, file)
      }, err => this.emit('error', err))
    }),
    vfs.dest(outFolder, outOpts)
  )
}

module.exports = {
  bundler,
  watcher,
  bundle,
  watch,
  dest,
  src,
}

