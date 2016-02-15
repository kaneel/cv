'use strict'

var Promise = require('korbutJS/src/Promise').Promise
var raf = require('korbutJS/src/dom/requestAnimationFrame').requestAnimationFrame

module.exports.createAnimation = function(func, duration) {
  duration = duration||3000
  return new Promise(function(resolve, reject, startDate) {
    startDate = Date.now()
    tick()
    function tick(progress) {
      progress = Math.min(1, (Date.now() - startDate) / duration)
      func(progress)
      if(progress < 1) {
        raf(tick)
      } else {
        resolve()
      }
    }
  })
}
