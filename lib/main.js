var Reduce = require('./reduce')
exports = module.exports = Reduce()
exports.Reduce = Reduce
exports.watch = require('./watch')
exports.lazypipe = require('lazypipe')
exports.dest = require('./dest')
exports.run = require('callback-sequence').run

