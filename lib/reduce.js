var depsify = require('./depsify')
var EventEmitter = require('events')
var inherits = require('util').inherits

inherits(Reduce, EventEmitter)

module.exports = Reduce

function Reduce() {}

Reduce.prototype.src = function(pattern, opts) {
  var b = depsify(pattern, opts)
  var onerror = this.emit.bind(this, 'error')

  b.on('log', this.emit.bind(this, 'log'))
  b.on('error', onerror)
  this.emit('instance', b)

  return b.bundle().on('error', onerror)
}

