'use strict'

var dr = require('korbutJS/src/dom/domReady')
var env = require('./lib/env')
var SApp = require('./lib/SApp').SApp
var app = new SApp({debug: env.debug})

document.body.classList.add('js')

dr.then(function() {
  return app.ready
})
.then(function() {
  app.swap(window.location.pathname)
})
.catch(function(err) {
  console.log(err)
})
