'use strict'

var SMainZViev = require('../views/SMainZView').SMainZView
var SectionZView = require('../views/commons/SectionZView').SectionZView
var main = new SMainZViev

var SEventRouter = require('../lib/SEventRouter')
var eventRouter = new SEventRouter.SEventRouter
var events = SEventRouter.events

var skills = {
    path: '/skills'
  , handleRoute: skillsRouteHandler
}

module.exports.routes = [skills]

function skillsRouteHandler(e, next) {
  next()
  main.swap(SMainZViev.PAGE_VIEW, ['SKILLS', '☜', 'KEYWORDS', 'HASHTAG', '❤︎', 'LOVE', 'READ', '☞', 'HIRE', '☝︎', 'READ', 'CLICK', '☟']).then(function() {
    main._skills.addEventListener(SectionZView.SHOWN_EVT, function onshown(){
      main._skills.removeEventListener(SectionZView.SHOWN_EVT, onshown)
      eventRouter.dispatchRoute(new events.AppReady)
    })
    main._skills.show()
  })
}
