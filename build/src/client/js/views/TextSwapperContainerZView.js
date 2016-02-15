'use strict'

var ZView = require('korbutJS/src/dom/ZView').ZView
var UID = require('korbutJS/src/UID').UID
var rAF = require('korbutJS/src/dom/requestAnimationFrame').requestAnimationFrame
var cAF = require('korbutJS/src/dom/requestAnimationFrame').cancelAnimationFrame

module.exports.TextSwapperContainerZView = ZView.extend(function(statics) {
  statics.WILL_SWAP_CLASS = 'resumeh-tldr--willswap'

  return {
      constructor: function() {
        ZView.apply(this)

        void function(self) {
          self.items = []

          self.model.setHook('cursor', function(v) {
            if (v == self.items.length)
              return '0'
            else if (+v<0)
              return self.items.length-1
            else if (v==0 || !v)
              return '0'
            return v
          })

          self.model.addEventListener('change', function(e) {
            switch(e.key) {
              case 'active':
                if (e.to)
                  init()
                else
                  stop()
              break
              case 'cursor':
                var o = self.items[+e.from]||null
                var n = self.items[e.to%self.items.length]

                if (n)
                  n.show(self.query('list'))

                if(o && o.root.parentNode == self.query('list'))
                  o.hide()
              break
            }
          })

          function init() {
            self._start = +(new Date)
            self._raf = rAF(render)
          }

          function stop() {
            cAF(self._raf)
          }

          function render() {
            // throttle a bit
            setTimeout(function() {
              self._raf = rAF(render)
            }, 50)
            self._now = +(new Date)
            if (self._now >= self._start + self._time - self._swap)
              self.swap()
            if (self._now >= self._start + self._time)
              self.inc()
          }
        }(this)
      }
    , _template: 'div.resumeh-tldr>ul@list'
    , _swap: 200
    , _time: 1000
    , swap: { enumerable: true, configurable: true,
        value: function() {
          this.root.classList.add(statics.WILL_SWAP_CLASS)
        }
      }
    , inc: { enumerable: true, configurable: true,
        value: function() {
          this._start = +(new Date)
          this.model.setItem('cursor', (+this.model.getItem('cursor')||0) + 1)
          this.root.classList.remove(statics.WILL_SWAP_CLASS)
        }
      }
    , add: { enumerable: true, configurable: true,
        value: function(v) {
          this.items.push(v)
        }
      }
    , activate: { enumerable: true, configurable: true,
          value: function() {
            this._activateTimer = setTimeout(function() {
              this.model.setItem('active', 1)
            }.bind(this), 1000)
          }
      }
    , deactivate: { enumerable: true, configurable: true,
          value: function() {
            clearTimeout(this._activateTimer)
            this.root.classList.remove(statics.WILL_SWAP_CLASS)
            this.model.setItem('active', 0)
          }
      }
  }
})

module.exports.TextSwapperItemZView = ZView.extend(function(statics) {
  statics.HIDE_CLASS = 'resumeh-tldr__item--hide'
  statics.SHOW_CLASS = 'resumeh-tldr__item--show'

  return {
      constructor: function() {
        ZView.apply(this, arguments)
        this.model.setItem("uid", this.uid)
      }
    , _template: 'li#$uid.resumeh-tldr__item{$text}[data-text=$text]'
    , uid: { enumerable: true, configurable: true,
          get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
      }
    , show: { enumerable: true, configurable: true,
          value: function(par) {
            par.appendChild(this.root)
            setTimeout(function() {
              this.root.classList.add(statics.SHOW_CLASS)
            }.bind(this), 50)
          }
      }
    , hide: { enumerable: true, configurable: true,
          value: function() {
            setTimeout(function() {
              this.root.classList.add(statics.HIDE_CLASS)
              setTimeout(function() {
                this.root.classList.remove(statics.HIDE_CLASS)
                this.root.classList.remove(statics.SHOW_CLASS)
                this.root.parentNode.removeChild(this.root)
              }.bind(this), 400)
            }.bind(this), 100)
          }
      }
  }
})
