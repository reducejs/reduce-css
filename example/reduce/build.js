var reduce = require('reduce-css')
var del = require('del')
var path = require('path')
var Transform = require('stream').Transform

var basedir = path.join(__dirname, 'src')

var i = process.argv.indexOf('-w')
if (i === -1) {
  i = process.argv.indexOf('--watch')
}
var needWatch = i > -1
if (needWatch) {
  var b = createBundler(true)
  b.on('update', function update() {
    bundle(b)
    return update
  }())
} else {
  bundle(createBundler())
}

function createBundler(watch) {
  var basedir = path.join(__dirname, 'src')
  var b = reduce.create(
    /* glob for entries */
    '*.css',

    /* options for depsify */
    {
      basedir,
      cache: {},
      packageCache: {},
    },

    /* options for common-bundle */
    // single bundle
    // 'bundle.css',
    // multiple bundles
    {
      groups: '*.css',
      common: 'common.css',
    },

    /* options for watchify2 */
    watch && { entryGlob: '*.css' }
  )
  return b
}

function bundle(b) {
  var startTime = Date.now()
  log('Start bundling')
  var build = path.join(__dirname, 'build')
  del.sync(build)
  return b.bundle().on('error', log)
    .pipe(Transform({
      objectMode: true,
      transform: function (file, enc, next) {
        log('-', file.relative, file.contents.length, 'bytes')
        next(null, file)
      }
    }))
    .pipe(b.dest(build, {
      maxSize: 0,
      name: '[name].[hash]',
      assetOutFolder: path.join(build, 'assets'),
    }))
    .on('end', () => log('End bundling in', Date.now() - startTime, 'ms'))
}

function log() {
  console.log.apply(console, [].map.call(arguments, function (msg) {
    if (typeof msg === 'string') {
      return msg
    }
    return JSON.stringify(msg, null, 2)
  }))
}

