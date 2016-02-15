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

var hidden, visibilityChange;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
  hidden = "hidden";
  visibilityChange = "visibilitychange";
} else if (typeof document.mozHidden !== "undefined") {
  hidden = "mozHidden";
  visibilityChange = "mozvisibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}

module.exports.SectionZView = klass(ZView, function(statics) {
  statics.TPL_STRING =
    '#$uid.resumeh-section.resumeh-section--_TYPE__CLASSNAME_> \
        (header@header>h1@title[data-text=$subtext]{$title})\
      + .resumeh-content@content'

  statics.makeTPL = function(type, className) {
    return statics.TPL_STRING.replace('_TYPE_', type||'generic').replace('_CLASSNAME_', className||'')
  }

  statics.SHOW_EVT = '/section/show'
  statics.SHOWN_EVT = '/section/shown'
  statics.HIDE_EVT = '/section/hide'
  statics.HIDDEN_EVT = '/section/hidden'

  return {
      constructor: function(dict) {
        ZView.apply(this, arguments)

        this.model.setItem("uid", this.uid)
        this.model.setItem("state", 0)

        void function(self) {
          self.query('content').innerHTML = dict.text

          self._cssReady = new Promise(function(resolve) {
            getCompat(function(properties){
              stylesheet.insertRule(
                  ['#', self.uid, '{}'].join('')
                , function(neh, rule) {
                    rule.setProperty(CSS_TRANSITION_PROPERTY, ['opacity ',self._transition_time,'ms ease-out'].join(''))

                    self.model.setHook('cursor', function(v) {
                      if (v == self._words.length)
                        return '0'
                      else if (+v<0)
                        return self._words.length-1
                      else if (v==0 || !v)
                        return '0'
                      return v
                    })

                    self.model.addEventListener('change', function(e) {
                      switch(e.key) {
                        case 'state':
                          if (e.to == 1)
                            show()
                          else if (e.to == 0)
                            hide()
                        break
                        case 'active':
                          if (e.to) {
                            self._start = +(new Date)
                            self._raf = rAF(render)
                          }
                          else {
                            cAF(self._raf)
                          }
                        break
                        case 'cursor':
                          self.query('title').setAttribute('data-text', self._words[e.to])
                          self._start = +(new Date)
                        break
                      }
                    })

                    self.hide()

                    self.model.setItem('cursor', 0)

                    function show() {
                      clearTimeout(self.animTimer)
                      self.dispatchEvent(statics.SHOW_EVT)
                      self._parent.appendChild(self.root)
                      self.root.style.display = 'block'
                      rule.setProperty('z-index', '101')
                      rAF(function() {
                        rule.setProperty('opacity', '1')
                        self.animTimer = setTimeout(function() {
                          self.dispatchEvent(statics.SHOWN_EVT)
                        }, self._transition_time)
                      })
                    }

                    function hide() {
                      clearTimeout(self.animTimer)
                      self.dispatchEvent(statics.HIDE_EVT)
                      rule.setProperty('opacity', '0')
                      rule.setProperty('z-index', '100')
                      rAF(function() {
                        self.animTimer = setTimeout(function() {
                          self.root.style.display = 'none'
                          self.dispatchEvent(statics.HIDDEN_EVT)
                        }, self._transition_time)
                      })
                    }
                })

              function render() {
                // throttle a bit
                setTimeout(function() {
                  self._raf = rAF(render)
                }, 200)
                self._now = +(new Date)
                if (self._now >= self._start + self._textswap)
                  self.model.setItem('cursor', (+self.model.getItem('cursor')||0) + 1)
              }

              resolve()
            })
          })

          self.addEventListener(statics.SHOW_EVT, function() {
            self.activate()
          })

          self.addEventListener(statics.HIDDEN_EVT, function() {
            self.deactivate()
          })
        }(this)
      }
    , _template: '.resumeh-section#$uid'
    , _transition_time: 425
    , _textswap: 1000
    , _words: ['0']
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
    , activate: { enumerable: true, configurable: true,
          value: function() {
            this.model.setItem('active', 1)
          }
      }
    , deactivate: { enumerable: true, configurable: true,
          value: function() {
            this.model.setItem('active', 0)
          }
      }
  }
})
