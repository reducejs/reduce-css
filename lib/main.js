exports = module.exports = require('./reduce')()
exports.watch = require('./watch')
exports.lazypipe = require('lazypipe')
exports.dest = require('./dest')
exports.run = require('callback-sequence').run

