'use strict'

var SMainZViev = require('../views/SMainZView').SMainZView
var SectionZView = require('../views/commons/SectionZView').SectionZView
var main = new SMainZViev

var SEventRouter = require('../lib/SEventRouter')
var eventRouter = new SEventRouter.SEventRouter
var events = SEventRouter.events

var about = {
    path: '/about'
  , handleRoute: aboutRouteHandler
}

module.exports.routes = [about]

function aboutRouteHandler(e, next) {
  next()
  main.swap(SMainZViev.PAGE_VIEW, ['ABOUT', '☜', 'FOLLOW', 'SHARE', '❤︎', 'LOVE', 'READ', '☞', 'HIRE', '☝︎', 'READ', 'CLICK', '☟']).then(function() {
    main._about.addEventListener(SectionZView.SHOWN_EVT, function onshown(){
      main._about.removeEventListener(SectionZView.SHOWN_EVT, onshown)
      eventRouter.dispatchRoute(new events.AppReady)
    })
    main._about.show()
  })
}
