'use strict'

var ZView = require('korbutJS/src/dom/ZView').ZView

var SEventRouter = require('../lib/SEventRouter')
var eventRouter = new SEventRouter.SEventRouter
var events = SEventRouter.events

module.exports.NavZView = ZView.extend(function(statics) {
  statics.VISIBLE_CLASS = 'resumeh-nav--visible'
  statics.REDUCED_CLASS = 'resumeh-nav--reduced'

  return {
      constructor: function(args, par) {
        args = Array.prototype.splice.call(arguments)
        ZView.apply(this, arguments)

        void function(self) {
          self.model.addEventListener('change', function(e) {
            switch(e.key) {
              case 'state':
                if (e.to)
                  self.root.classList.add(statics.VISIBLE_CLASS)
                else
                  self.root.classList.remove(statics.VISIBLE_CLASS)
              break
              case 'reduced':
                if (e.to)
                  self.root.classList.add(statics.REDUCED_CLASS)
                else
                  self.root.classList.remove(statics.REDUCED_CLASS)
              break
            }
          })

          eventRouter.addRouteHandler(events.viewportscroll, function(e, next, query) {
            next()

            if (e.detail.y > 20)
              self.model.setItem('reduced', 1)
            else
              self.model.setItem('reduced', 0)
          })
        }(this)
      }
    , _template: '.resumeh-nav>a.resumeh-nav__back@back[href=/]>span.resumeh-nav__back-icon{←}+span.resumeh-nav__back-text{BACK}'
    , show: { enumerable: true, configurable: true,
          value: function() {
            this.model.setItem('state', 1)
          }
      }
    , hide: { enumerable: true, configurable: true,
          value: function() {
            this.model.setItem('state', 0)
          }
      }
  }
})
