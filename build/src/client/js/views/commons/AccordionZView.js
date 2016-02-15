'use strict'

var klass = require('korbutJS/src/class').class
var ZView = require('korbutJS/src/dom/ZView').ZView
var rAF = require('korbutJS/src/dom/requestAnimationFrame').requestAnimationFrame
var cAF = require('korbutJS/src/dom/requestAnimationFrame').cancelAnimationFrame
var UID = require('korbutJS/src/UID').UID

var Promise = require('korbutJS/src/Promise').Promise

var stylesheet = require('../../lib/stylesheet').stylesheet
var getCompat = require('../../lib/stylesheet').getCompat
var std_transition = require('../../lib/stylesheet').std_transition
var CSS_TRANSITION_PROPERTY = require('../../lib/stylesheet').CSS_TRANSITION_PROPERTY

var SEventRouter = require('../../lib/SEventRouter')
var eventRouter = new SEventRouter.SEventRouter
var events = SEventRouter.events

module.exports.AccordionZView = klass(ZView, function(statics) {
  statics.SHOW_EVT = '/accordion/show'
  statics.SHOWN_EVT = '/accordion/shown'
  statics.HIDE_EVT = '/accordion/hide'
  statics.HIDDEN_EVT = '/accordion/hidden'

  statics.SHOW_CLASS = 'resumeh-accordion--show'
  statics.SHOWN_CLASS = 'resumeh-accordion--shown'

  return {
      constructor: function() {
        ZView.apply(this, arguments)

        this.model.setItem("uid", this.uid)

        void function(self) {
          self._cssReady = new Promise(function(resolve) {
            getCompat(function(properties){
              stylesheet.insertRule(
                  ['#', self.uid, '{}'].join('')
                , ['#', self.uid, ' .resumeh-accordion__content{overflow:hidden;}'].join('')
                , function(neh, main, rule) {
                    rule.setProperty(CSS_TRANSITION_PROPERTY, ['opacity ', self._transition_time+200 , 'ms, ', 'height ',self._transition_time,'ms ease-in-out'].join(''))

                    self.model.addEventListener('change', function(e) {
                      switch(e.key) {
                        case 'state':
                          if (e.to == 1)
                            show()
                          else if (e.to == 0)
                            hide()
                        break
                      }
                    })

                    self.hide()

                    self.query('title').addEventListener('click', function(e) {
                      e.preventDefault()
                      if (self.model.getItem('state'))
                        self.hide()
                      else
                        self.show()
                    })

                    eventRouter.addRouteHandler(events.viewportresize, function(e, n, s) {
                        if (self.model.getItem('state'))
                          copyAndMesure(self.query('content')).then(function(v) {
                            rule.setProperty('height', v+'px')
                          })
                      n()
                    })

                    function show(height) {
                      self.dispatchEvent(statics.SHOW_EVT)
                      copyAndMesure(self.query('content')).then(function(h) {
                        rule.setProperty('height', h+'px')
                        rule.setProperty('opacity', '1')
                        self.animTimer = setTimeout(function() {
                          self.dispatchEvent(statics.SHOWN_EVT)
                        }, self._transition_time)
                      })
                    }

                    function hide() {
                      self.dispatchEvent(statics.HIDE_EVT)
                      rule.setProperty('height', '0px')
                      rule.setProperty('opacity', '0')
                      rAF(function() {
                        self.animTimer = setTimeout(function() {
                          self.dispatchEvent(statics.HIDDEN_EVT)
                        }, self._transition_time)
                      })
                    }
                  }
              )

              self.addEventListener(statics.SHOW_EVT, function() {
                self.root.classList.add(statics.SHOW_CLASS)
              })

              self.addEventListener(statics.SHOWN_EVT, function() {
                self.root.classList.add(statics.SHOWN_CLASS)
              })

              self.addEventListener(statics.HIDE_EVT, function() {
                self.root.classList.remove(statics.SHOW_CLASS)
              })

              self.addEventListener(statics.HIDDEN_EVT, function() {
                self.root.classList.remove(statics.SHOWN_CLASS)
              })

              resolve()
            })
          })
        }(this)
      }
    , _transition_time: 225
    , uid: { enumerable: true, configurable: true,
           get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
       }
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

function copyAndMesure(n, p, h) {
  p = n.parentNode
  n = n.cloneNode(true)
  n.style.position = 'relative'
  n.style.height = 'auto'
  n.style.top = '-9999px'
  n.style.left = '-9999px'

  p.appendChild(n)

  return new Promise(function(resolve, reject, h) {
    h = getHeight(n)
    n.parentNode.removeChild(n)
    rAF(function() {
      resolve(h)
    })
  })
}

function getHeight(n) {
  return n.offsetHeight
}
