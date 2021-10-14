const { join, dirname } = require('path')
const pkg = require(join(dirname(dirname(__dirname)), 'package.json'))

module.exports = (cli) => cli.version(pkg.version)