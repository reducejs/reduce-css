var lazypipe = require('lazypipe')
var watchify = require('watchify2')
var depsify = require('./depsify')
var run = require('callback-sequence').run
var EventEmitter = require('events')
var inherits = require('util').inherits
inherits(Watch, EventEmitter)

module.exports = Watch

function Watch(opts) {
  this.options = opts
}

Watch.prototype.src = function(pattern, opts) {
  opts = opts || {}
  // necessary for watch
  opts.cache = opts.cache || {}
  opts.packageCache = opts.packageCache || {}
  var b = watchify(depsify(pattern, opts), this.options)
  var bundle = this.bundle.bind(this, b)

  b.on('log', this.emit.bind(this, 'log'))
  b.on('error', this.emit.bind(this, 'error'))
  b.on('update', bundle)

  this.b = b
  this.emit('instance', b)
  // allow lazypipe to collect transforms
  process.nextTick(bundle)

  return this
}

Watch.prototype.bundle = function(b) {
  run([this._bundle.bind(this, b)])
    .catch(this.emit.bind(this, 'error'))
    .then(this.emit.bind(this, 'done'))
}

Watch.prototype._bundle = function(b) {
  if (!this._lazypipe) return b.bundle()
  return b.bundle()
    .on('error', this.emit.bind(this, 'error'))
    .pipe(this._lazypipe())
}

Watch.prototype.close = function() {
  this.emit('close')
  this.b.close()
}

Watch.prototype.pipe = function() {
  if (!this._lazypipe) {
    this._lazypipe = lazypipe()
  }
  this._lazypipe = this._lazypipe.pipe.apply(this._lazypipe, arguments)
  return this
}

