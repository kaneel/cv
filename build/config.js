'use strict'

const path = require('path')

const root = path.resolve(process.cwd(), '../')
const src = path.join(root, 'build/src')
const client = path.join(root, 'client')
console.log(root, src, client)

module.exports.paths = {
    root: root
  , src: src
  , client: client
}
