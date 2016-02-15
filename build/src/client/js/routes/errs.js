'use strict'

var SMainZViev = require('../views/SMainZView').SMainZView
var SectionZView = require('../views/commons/SectionZView').SectionZView
var main = new SMainZViev

var SEventRouter = require('../lib/SEventRouter')
var eventRouter = new SEventRouter.SEventRouter
var events = SEventRouter.events

var e404 = {
    path: '/404'
  , handleRoute: e404RouteHandler
}

module.exports.routes = [e404]

function e404RouteHandler(e, next) {
  next()
  main.swap(SMainZViev.PAGE_VIEW, ['404', '☜', 'ERRRRRRRR', 'PBCAK', '❤︎', 'LOVE', 'READ', '☞', 'HIRE', '☝︎', 'READ', 'CLICK', '☟']).then(function() {
    main._e404.addEventListener(SectionZView.SHOWN_EVT, function onshown(){
      main._e404.removeEventListener(SectionZView.SHOWN_EVT, onshown)
      eventRouter.dispatchRoute(new events.AppReady)
    })
    main._e404.show()
  })
}
