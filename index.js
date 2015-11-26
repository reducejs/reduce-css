var Reduce = require('./lib/reduce')
exports = module.exports = Reduce()
exports.Reduce = Reduce
exports.watch = require('./lib/watch')
exports.lazypipe = require('lazypipe')
exports.dest = require('./lib/dest')
exports.run = require('callback-sequence').run

