'use strict'

var SMainZViev = require('../views/SMainZView').SMainZView
var main = new SMainZViev

var SEventRouter = require('../lib/SEventRouter')
var eventRouter = new SEventRouter.SEventRouter
var events = SEventRouter.events

var about = require('./about').routes
var skills = require('./skills').routes
var exp = require('./exp').routes
var errs = require('./errs').routes

var home = {
    path: '/'
  , handleRoute: homeRouteHandler
}

module.exports.routes = [home].concat(about, skills, exp, errs)

function homeRouteHandler(e, next) {
  next()
  main.swap(SMainZViev.HOME_VIEW).then(function() {
    eventRouter.dispatchRoute(new events.AppReady)
  })
}
