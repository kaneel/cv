'use strict'

var singleton = require('korbutJS/src/class').singleton
var Model = require('korbutJS/src/Model').Model
var ClientRect = require('korbutJS/src/dom/ClientRect').ClientRect

var utils = require('./utils')

var SEventRouter = require('./SEventRouter')

var eventRouter = new SEventRouter.SEventRouter
var events = SEventRouter.events

var stylesheet = require('../lib/stylesheet').stylesheet

var scrollElement = function() {
  if (document.body.scrollTop > document.documentElement.scrollTop)
    return document.body

  return document.documentElement
}

module.exports.SViewport = singleton(Model, function() {

  return {
      constructor: function(dict) {
        Model.call(this, dict||{})

        void function(self, w, d, docEl, body) {
          self.lockers = 0

          eventRouter.addRouteHandler(events.viewportresize, function(e, next) {
            self.setItem('dimensions', e.detail)
            next()
          })

          eventRouter.addRouteHandler(events.viewportscroll, function(e, next) {
            self.setItem('scroll', e.detail)
            next()
          })

          w.addEventListener('resize', self._resize = function(e, CR) {
            eventRouter.dispatchRoute(new events.ViewportResize(getDimensions()))
          })

          w.addEventListener('scroll', self._resize = function(x, y, docHeight) {
            docHeight = Math.max( d.body.scrollHeight, d.body.offsetHeight,
                       d.documentElement.clientHeight, d.documentElement.scrollHeight, d.documentElement.offsetHeight )
            x = Math.min(Math.max(0, w.scrollX), docHeight)
            y = Math.min(Math.max(0, w.scrollY), docHeight)
            eventRouter.dispatchRoute(new events.ViewportScroll({x: x, y: y}))
          })

          stylesheet.insertRule(
              'html{}'
            , function(stuff, html) {
                eventRouter.addRouteHandler(events.viewportlock, function() {
                  self.lockers += 1
                  html.setProperty('overflow', 'hidden')
                })

                eventRouter.addRouteHandler(events.viewportunlock, function() {
                  self.lockers -= 1
                  if (self.lockers < 0) self.lockers = 0
                  if (self.lockers == 0)
                    html.setProperty('overflow', '')
                })
              }
          )

          eventRouter.dispatchRoute(new events.ViewportResize(getDimensions()))
          eventRouter.dispatchRoute(new events.ViewportScroll({x: w.scrollX, y:w.scrollY}))

          function getDimensions() {
            return {
                width: w.innerWidth || d.documentElement.clientWidth || d.body.clientWidth
              , height: w.innerHeight|| d.documentElement.clientHeight|| d.body.clientHeight
            }
          }
        }(this, window, document)
      }
    , width: {
        get: function() {
          return this.getItem('dimensions.width')
        }
      }
    , height: {
        get: function() {
          return this.getItem('dimensions.height')
        }
      }
    , save: {
          value: function() {
            this._saved = JSON.parse(JSON.stringify(this.raw))
          }
      }
    , restore: {
          value: function() {
            this.scroll(this._saved.scroll.x, this._saved.scroll.y)
            delete this._saved
          }
      }
    , scroll: {
          value: function(x, y, speed, startX, startY) {
            startX = window.pageXOffset
            startY = window.pageYOffset
            x = typeof x == 'undefined' ? startX :
                      x >- 1 ? x : startX
            y = typeof y == 'undefined' ? startY :
                      y >- 1 ? y : startY


            if (!speed)
              window.scrollTo(x, y)
            else
              void function(diffX, diffY) {
                utils.createAnimation(function(progress) {
                  window.scrollTo(
                    (1 - progress) * startX + x * progress,
                    (1 - progress) * startY + y * progress
                  )
                }, speed)
              }(startX-x, startY-y)
          }
      }
    , lock: {
          value: function() {
            eventRouter.dispatchRoute(new events.ViewportLock)
          }
      }
    , unlock: {
          value: function() {
            eventRouter.dispatchRoute(new events.ViewportUnlock)
          }
      }
  }
})
