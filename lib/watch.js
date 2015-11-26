var lazypipe = require('lazypipe')
var watchify = require('watchify')
var depsify = require('./depsify')
var run = require('run-callback')
var EventEmitter = require('events')
var inherits = require('util').inherits
inherits(Reduce, EventEmitter)

module.exports = Reduce

function Reduce(opts) {
  if (!(this instanceof Reduce)) {
    return new Reduce(opts)
  }
  this.options = opts
}

Reduce.prototype.src = function(pattern, opts) {
  opts = opts || {}
  // necessary for watch
  opts.cache = opts.cache || {}
  opts.packageCache = opts.packageCache || {}
  var b = depsify(pattern, opts)
  watchify(b, this.options)

  var onerror = this.emit.bind(this, 'error')
  var self = this
  var bundle = function () {
    run(function () {
      var s = b.bundle()
      if (self._lazypipe) {
        return s.on('error', onerror).pipe(self._lazypipe())
      }
      return s
    }, function (err) {
      if (err) {
        return onerror(err)
      }
      // allow to listen for bundling done
      self.emit('change')
    })
  }

  b.on('log', this.emit.bind(this, 'log'))
  b.on('error', onerror)
  b.on('update', bundle)
  this.emit('instance', b)

  // allow lazypipe to collect transforms
  process.nextTick(bundle)

  this.b = b

  return this
}

Reduce.prototype.close = function() {
  this.b.close()
  this.emit('close')
}

Reduce.prototype.pipe = function() {
  if (!this._lazypipe) {
    this._lazypipe = lazypipe()
  }
  this._lazypipe = this._lazypipe.pipe.apply(this._lazypipe, arguments)
  return this
}

