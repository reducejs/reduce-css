var Reduce = require('./lib/reduce')
var Watch = require('./lib/watch')
exports = module.exports = new Reduce()
exports.Reduce = function () {
  return new Reduce()
}
exports.watch = function (opts) {
  return new Watch(opts)
}
exports.lazypipe = require('lazypipe')
exports.dest = require('./lib/dest')
exports.run = require('callback-sequence').run

