require('babel-register')
const requireDir = require('require-dir')
requireDir('./gulp', { recurse: true })
