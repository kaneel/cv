'use strict'

var ZView = require('korbutJS/src/dom/ZView').ZView
var rAF = require('korbutJS/src/dom/requestAnimationFrame').requestAnimationFrame
var cAF = require('korbutJS/src/dom/requestAnimationFrame').cancelAnimationFrame
var UID = require('korbutJS/src/UID').UID

var Promise = require('korbutJS/src/Promise').Promise

var stylesheet = require('../lib/stylesheet').stylesheet
var getCompat = require('../lib/stylesheet').getCompat
var std_transition = require('../lib/stylesheet').std_transition
var CSS_TRANSITION_PROPERTY = require('../lib/stylesheet').CSS_TRANSITION_PROPERTY

module.exports.LoadingOverlayZView = ZView.extend(function(statics) {
  statics.SHOW_EVT = '/section/show'
  statics.SHOWN_EVT = '/section/shown'
  statics.HIDE_EVT = '/section/hide'
  statics.HIDDEN_EVT = '/section/hidden'

  statics.PREP_CLASS = 'resumeh-overlay--prepare'
  statics.START_CLASS = 'resumeh-overlay--start'

  return {
      constructor: function() {
        ZView.apply(this, arguments)

        this.model.setItem("uid", this.uid)
        this.model.setItem("state", 0)

        this._arr = this._words

        void function(self) {
          self._cssReady = new Promise(function(resolve) {
            getCompat(function(properties){
              stylesheet.insertRule(
                  ['#', self.uid, '{}'].join('')
                , function(neh, rule) {
                    rule.setProperty(CSS_TRANSITION_PROPERTY, ['opacity ',self._transition_time,'ms ease-out'].join(''))

                    self.model.setHook('cursor', function(v) {
                      if (v == self._arr.length)
                        return '0'
                      else if (+v<0)
                        return self._arr.length-1
                      else if (v==0 || !v)
                        return '0'
                      return v
                    })

                    self.model.addEventListener('change', function(e) {
                      switch(e.key) {
                        case 'state':
                          if (e.to == 1 && !e.from)
                            show()
                          else if (e.to == 2)
                            self._arr = self._words2, self.model.setItem('cursor', '0'), self.root.classList.add(statics.PREP_CLASS)
                          else if (!e.to)
                            hide(), self._arr = self._words
                        break
                        case 'active':
                          if (e.to)
                            self._start = +(new Date),
                            self._raf = rAF(render)
                          else
                            cAF(self._raf)
                        break
                        case 'cursor':
                          self.query('text').setAttribute('data-text', self._arr[e.to])
                          if (typeof self.root.textContent != 'undefned')
                            self.query('text').textContent = self._arr[e.to]
                          else
                            self.query('text').innerText = self._arr[e.to]
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
                        setTimeout(function() {
                          self.root.classList.add(statics.START_CLASS)
                        }, 100)
                        self.animTimer = setTimeout(function() {
                          self.dispatchEvent(statics.SHOWN_EVT)
                        }, self._transition_time)
                      })
                    }

                    function hide() {
                      clearTimeout(self.animTimer)
                      self.root.classList.remove(statics.START_CLASS)
                      self.root.classList.remove(statics.PREP_CLASS)
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

              self.addEventListener(statics.HIDDEN_EVT, function() {
                if (self.root.parentNode == self._parent)
                  self._parent.removeChild(self.root)
              })

              function render() {
                self._raf = rAF(render)
                self._now = +(new Date)
                if (self.model.getItem('state') == 1 && self._now >= self._start + self._textswap)
                  self.model.setItem('cursor', (+self.model.getItem('cursor')||0) + 1)
                else if (self.model.getItem('state') == 2 && self._now >= self._start + self._textswap2)
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
    , _words: ['READ', '☜', 'FOLLOW', 'READ', '❤︎', 'LOVE', 'READ', '☞', 'HIRE', '☝︎', 'READ', 'CLICK', '☟']
    , _words2: ['!!!', '']
    , _template: '.resumeh-overlay#$uid>\
              .resumeh-overlay__text[data-text=$text]@text{$text}\
            + (.resumeh-overlay__circle>\
                (.resumeh-overlay__circle-left-wrap>.resumeh-overlay__circle-loader)\
              + (.resumeh-overlay__circle-right-wrap>.resumeh-overlay__circle-loader)\
              + .resumeh-overlay__circle-mark)'
    , _textswap: 80
    , _textswap2: 50
    , _transition_time: 100
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
    , prepare: { enumerable: true, configurable: true,
          value: function() {
            this.model.setItem('state', 2)
          }
      }
  }
})
