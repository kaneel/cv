'use strict'

var domReady = require('korbutJS/src/dom/domReady')
var singleton = require('korbutJS/src/class').singleton
var Promise = require('korbutJS/src/Promise').Promise
var Router = require('korbutJS/src/Router').Router

var routes = require('../routes').routes

var SEventRouter = require('../lib/SEventRouter')
var eventRouter = new SEventRouter.SEventRouter
var events = SEventRouter.events

var SViewport = require('../lib/SViewport').SViewport

var SMainZView = require('../views/SMainZView').SMainZView

var win = window
var doc = document
var dBody  = doc.body
// var docMain = doc.getElementById('resumeh-wrapper')
var docMain = doc.body

module.exports.SApp = singleton(function() {
  return {
      constructor: function(opts) {
        this.bus = eventRouter
        this.router = new Router
        this.viewport = new SViewport
        this.page = new SMainZView

        docMain.appendChild(this.page.root)

        void function(self) {
          win.onpopstate = function(e) {
            console.log("routing back to", win.location.pathname)
            self.swap(win.location.pathname)
          }

          doc.addEventListener('click', function(e, node, href) {
            node = e.target.tagName == 'A' ? e.target : checkIfAnchorChildren(e.target)
            href = typeof node.getAttribute == 'function' ? node.getAttribute('href') : null

            self._click = true

            if (!href || href[0] == '#') return

            if (node
                && !!~node.href.indexOf(window.location.hostname)
                && !node.getAttribute('data-noroute'))
              void function() {
                e.preventDefault()
                console.log("will route to", href)
                history.pushState(null, "", href)
                self.swap(href)
              }()
          })

          routes.forEach(function(route) {
            self.router.addRouteHandler(route.path, route.handleRoute)
          })

          // add ALL
          self.router.addRouteHandler('*', function(s, next) {
            if (opts.debug)
              console.log('finally routing to', s.path)
            next()
          })

          // router remains
          self.router.addRouteHandler('catchall', function(e, next) {
            fetch(win.location.pathname).then(function(response) {
              if (response.status == '403')
                self.route('/403')
              else
                self.route('/404')
            })
            next()
          })

          eventRouter.addRouteHandler(events.appready, function(e, next) {
            self._ready = true
            // always replace the state so you can pass retrieved state
            history.replaceState(e.detail, '')
            next()
          })

          eventRouter.addRouteHandler(events.appwillgoback, function(e, next) {
            e.promise.then(function() {
              self.back()
            }, function(){
              console.error('app couldn\'t go back for some reason?')
            })
            next()
          })

          // on appwillrender
          eventRouter.addRouteHandler(events.appwillrender, function(e, next) {
            console.log('will render')
            // will wait for readiness before executing the current _routing method
            self.route(self._toRoute)
            // e.ready.then(function() {
            //   self.route(self._toRoute)
            // })
            next()
          })

          eventRouter.addRouteHandler(events.appwilldispatch, function(e, next) {
            console.log('dispatch')
            e.ready.then(function() {
              console.log('dispatch then')
              eventRouter.dispatchRoute(new events.AppWillRender)
            })
            next()
          })

          self.ready = Promise.all([domReady])
        }(this)
      }
    , locations: {
        get: function() {
          return this._locs||(this._locs=[])
        }
     }
    , route: {
        value: function(path, hit) {
          this.locations.push(path)
          if ( hit = this.router.dispatchRoute(path), !hit  )
          if ( hit = this.router.dispatchRoute("catchall"), !hit  )
            throw new Error('no routes')
        }
      }
    , back: {
          value: function() {
            window.history.back()
          }
      }
    , swap: {
          value: function(path) {
            this._toRoute = path
            this._ready = false
            // dispatch the "will dispatch", listened by overlay
            eventRouter.dispatchRoute(new events.AppWillDispatch)
          }
      }
  }
})

function checkIfAnchorChildren(node) {
  while (node = node.parentNode) {
    if (node.tagName == 'A') return node
  }

  return false
}
