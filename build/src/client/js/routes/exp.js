'use strict'

var SMainZViev = require('../views/SMainZView').SMainZView
var SectionZView = require('../views/commons/SectionZView').SectionZView
var main = new SMainZViev

var SEventRouter = require('../lib/SEventRouter')
var eventRouter = new SEventRouter.SEventRouter
var events = SEventRouter.events

var exp = {
    path: '/exp'
  , handleRoute: expRouteHandler
}

module.exports.routes = [exp]

function expRouteHandler(e, next) {
  next()
  main.swap(SMainZViev.PAGE_VIEW, ['EXPERIENCE', '☜', 'PAST', 'FUTURE', '❤︎', 'LOVE', 'READ', '☞', 'HIRE', '☝︎', 'READ', 'CLICK', '☟']).then(function() {
    main._exp.addEventListener(SectionZView.SHOWN_EVT, function onshown(){
      main._exp.removeEventListener(SectionZView.SHOWN_EVT, onshown)
      eventRouter.dispatchRoute(new events.AppReady)
    })
    main._exp.show()
  })
}
