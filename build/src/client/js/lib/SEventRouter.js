'use strict'

var klass = require('korbutJS/src/class').class
var singleton = require('korbutJS/src/class').singleton
var Route = require('korbutJS/src/Route').Route
var Router = require('korbutJS/src/Router').Router

var appWillRenderS = '/app/will/render'
var appWillDispatchS = '/app/will/dispatch'
var appWillGoBackS = '/app/will/back'
var appCleanS = '/app/clean'
var appReadyS = '/app/ready'

var viewportLockS = '/viewport/lock'
var viewportUnlockS = '/viewport/unlock'
var viewportScrollS = '/viewport/scroll'
var viewportResizeS = '/viewport/resize'

var SEventRouter = module.exports.SEventRouter = singleton(Router, function() {
  return {
      constructor: function(opts) {
        Router.apply(this, arguments)
      }
  }
})

var eventRouter = new SEventRouter

var AppWillGoBack = klass(Route, {
    constructor: function(dict){
        Route.call(this, appWillGoBackS, dict||{})
        this.promise = new Promise(function(res, rej) {
          res()
        })
    }
  , ready:  {
      enumerable: true, get: function(){ return this._ready },
      set: function(v){this._ready = v}
    }
})

var AppWillRender = klass(Route, {
    constructor: function(dict){
        Route.call(this, appWillRenderS, dict||{})
        this.ready = new Promise(function(res, rej){
          setTimeout(res, 100)
        })
    }
  , ready:  {
      enumerable: true, get: function(){ return this._ready },
      set: function(v){this._ready = v}
    }
})

var AppWillDispatch = klass(Route, {
    constructor: function(dict){
      Route.call(this, appWillDispatchS, dict||{})
      this.ready = new Promise(function(res, rej){
        setTimeout(res, 100)
      })
    }
  , ready:  {
      enumerable: true, get: function(){ return this._ready },
      set: function(v){this._ready = v}
    }
})


var AppClean = klass(Route, {
    constructor: function(dict){
      Route.call(this, appCleanS, dict||{})
      this.ready = new Promise(function(res, rej){
        setTimeout(res, 0)
      })
    }
  , ready:  {
      enumerable: true, get: function(){ return this._ready },
      set: function(v){this._ready = v}
    }
})

var AppReady = klass(Route, {
    constructor: function(dict){
      Route.call(this, appReadyS, dict||{})
      this.ready = new Promise(function(res, rej){
        setTimeout(res, 100)
      })
    }
  , ready:  {
      enumerable: true, get: function(){ return this._ready },
      set: function(v){this._ready = v}
    }
})

var ViewportLock = klass(Route, {
    constructor: function(dict){
      Route.call(this, viewportLockS, dict||{})
    }
})

var ViewportUnlock = klass(Route, {
    constructor: function(dict){
      Route.call(this, viewportUnlockS, dict||{})
    }
})

var ViewportResize = klass(Route, {
    constructor: function(dict){
      Route.call(this, viewportResizeS, dict||{})
    }
})

var ViewportScroll = klass(Route, {
    constructor: function(dict){
      Route.call(this, viewportScrollS, dict||{})
    }
})



module.exports.events = {
    appwillrender: appWillRenderS
  , appwilldispatch: appWillDispatchS
  , appcleanS: appCleanS
  , appready: appReadyS
  , appwillgoback: appWillGoBackS

  , viewportlock: viewportLockS
  , viewportunlock: viewportUnlockS
  , viewportresize: viewportResizeS
  , viewportscroll: viewportScrollS

  , navopen: 'ui/nav/open'
  , navclose: 'ui/nav/close'

  , AppWillRender: AppWillRender
  , AppWillDispatch: AppWillDispatch
  , AppClean: AppClean
  , AppReady: AppReady
  , AppWillGoBack: AppWillGoBack

  , ViewportLock: ViewportLock
  , ViewportUnlock: ViewportUnlock
  , ViewportResize: ViewportResize
  , ViewportScroll: ViewportScroll
}
