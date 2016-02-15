'use strict'

var singleton = require('korbutJS/src/class').singleton
var ZView = require('korbutJS/src/dom/ZView').ZView
var UID = require('korbutJS/src/UID').UID
var Promise = require('korbutJS/src/Promise').Promise

var viewport = new (require('../lib/SViewport').SViewport)

var AboutZView = require('./AboutZView').AboutZView
var SkillsZView = require('./SkillsZView').SkillsZView
var ExpZView = require('./ExpZView').ExpZView
var E404ZView = require('./E404ZView').E404ZView

var TextSwapperContainerZView = require('./TextSwapperContainerZView').TextSwapperContainerZView
var TextSwapperItemZView = require('./TextSwapperContainerZView').TextSwapperItemZView

var LoadingOverlayZView = require('./LoadingOverlayZView').LoadingOverlayZView

// var BackgroundZView = require('./BackgroundZView').BackgroundZView

var NavZView = require('./NavZView').NavZView

var SViewport = require('../lib/SViewport').SViewport

var SEventRouter = require('../lib/SEventRouter')
var eventRouter = new SEventRouter.SEventRouter
var events = SEventRouter.events

var rAF = require('korbutJS/src/dom/requestAnimationFrame').requestAnimationFrame
var cAF = require('korbutJS/src/dom/requestAnimationFrame').cancelAnimationFrame


var textAbout = require('../../md/about.md')
var textSkills = require('../../md/skills.md')
var textExp = require('../../md/exp.md')
var text404 = require('../../md/404.md')

var splash = document.getElementById('resumeh-splash')

module.exports.SMainZView = singleton(ZView, function(statics) {
  statics.HOME_VIEW = 'view/home'
  statics.PAGE_VIEW = 'view/page'

  statics.PAGE_CLASS = 'resumeh--page'

  return {
      constructor: function(args) {
          args = Array.prototype.splice.call(arguments)
          args.view = statics.HOME_VIEW

          ZView.apply(this, args)

          void function(self, views, meh, neh, noez) {
            views = [
                new AboutZView({title:'ABOUT', type: 'about', text: textAbout})
              , new SkillsZView({title:'SKILLS', type: 'skills', text: textSkills})
              , new ExpZView({title:'EXPERIENCE', type: 'exp', text: textExp})
              , new E404ZView({title:'404', type: 'e404', text: text404})
            ]

            copyAndMesure(splash).then(function(v) {
              self._splashHeight = v
              splash.style.height = v+'px'
            })

            self.overlay = new LoadingOverlayZView
            self.nav = new NavZView

            self.overlay._parent = self.root

            // neh = self.neh = new BackgroundZView
            meh = self.meh = new TextSwapperContainerZView
            noez = document.querySelector('.resumeh-tldr')
            // document.body.appendChild(neh.root)

            for (var lolz = document.querySelectorAll('.resumeh-tldr__item'), i = 0, max = lolz.length; i < max; i++)
              void function(lel) {
                meh.add(new TextSwapperItemZView({text: lel.textContent||lel.innerText}))
              }(lolz[i])

            noez.parentNode.replaceChild(meh.root, noez)
            meh.model.setItem("cursor", 0)

            self.root.appendChild(self.nav.root)

            eventRouter.addRouteHandler(events.viewportresize, function(e, n, s) {
                copyAndMesure(splash).then(function(v) {
                  self._splashHeight = v
                  if (self.model.getItem('view') == statics.HOME_VIEW)
                    splash.style.height = v+'px'
                })

              n()
            })

            self.model.addEventListener('change', function(e) {
              switch(e.key) {
                case 'view':
                  clearTimeout(self._pre)
                  if (e.to == statics.HOME_VIEW)
                    void function() {
                      self.nav.hide()
                      self._pre = setTimeout(function() {
                        document.body.classList.remove(statics.PAGE_CLASS)
                        splash.style.height = self._splashHeight+'px'
                        meh.activate()
                        new SViewport().unlock()
                        document.removeEventListener('keyup', self._onkeyup)
                      }, 400)
                    }()
                  else if (e.to == statics.PAGE_VIEW)
                    void function() {
                      meh.deactivate()
                      self._pre = setTimeout(function() {
                        self.overlay.show()
                      }, 400)
                      document.body.classList.add(statics.PAGE_CLASS)
                      splash.style.height = '0px'
                      eventRouter.addRouteHandler(events.appready, self._onappready = function onappready(e, next) {
                        eventRouter.removeRouteHandler(events.appready, onappready)
                        next()
                        self.nav.show()
                        document.addEventListener('keyup', self._onkeyup = function(e) {
                          if (e.keyCode == 27)
                            self.nav.query('back').click()
                        })
                      })
                    }()
                break
              }
            })

            eventRouter.addRouteHandler(events.appwilldispatch, function(e, next, v) {
              next()
              v = new SViewport()
              v.scroll(0, 0, 200)
              v.lock()
            })

            eventRouter.addRouteHandler(events.appready, function(e, next, v) {
              next()
              v = new SViewport()
              v.unlock()
            })

            views.forEach(function(view) {
              self['_'+view.model.getItem('type')] = view
              view._parent = self.root
              eventRouter.addRouteHandler(events.appwilldispatch, function(s, n) {
                view.hide()
                n()
              })
            })
          }(this)
      }
    , _template: '.resumeh-main'
    , swap: {
        value: function(view, words) {
          this.overlay._arr = words
          eventRouter.removeRouteHandler(events.appready, this._onappready)
          clearTimeout(this._swaptimer)
          this.model.setItem('view', view)
          if (view == statics.PAGE_VIEW)
            return function(self) {
              return new Promise(function(resolve) {
                self._swaptimer = setTimeout(resolve, 1200)
              })
              .then(function() {
                self.overlay.prepare()
                return new Promise(function(resolve) {
                  self._swaptimer = setTimeout(resolve, 1000)
                })
              })
              .then(function() {
                self.overlay.hide()
                return new Promise(function(resolve) {
                  self._swaptimer = setTimeout(resolve, 200)
                })
              })
            }(this)
          else
            return function(self) {
              return new Promise(function(resolve) {
                self.overlay.hide()
                self._swaptimer = setTimeout(resolve, 200)
              })
            }(this)
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
