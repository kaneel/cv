'use strict'

var klass = require('korbutJS/src/class').class
var UID = require('korbutJS/src/UID').UID
var rAF = require('korbutJS/src/dom/requestAnimationFrame').requestAnimationFrame
var cAF = require('korbutJS/src/dom/requestAnimationFrame').cancelAnimationFrame

var Scene = module.exports.Scene = klass(function(statics, scenes) {
  scenes = Object.create(null)

  statics.getByUid = function(uid) {
    return scenes[uid] && scenes[uid].instance
  }

  return {
      constructor: function(opts) {
        scenes[this.uid] = { instance: this }

        if (typeof opts == 'object')
          for (var k in opts) if (opts.hasOwnProperty(k))
            this['_'+k] = opts[k]

        this.time = this._time
      }
    , uid: { enumerable: true, configurable: true,
        get: function() {
          return this._uid||(this._uid=UID.uid())
        }
      }
    , chance: { enumerable: true, configurable: true,
        get: function() {
          return this._chance||100
        }
      }
    , time: { enumerable: true, configurable: true,
          get: function() {
            return this._newtime||Infinity
          }
        , set: function(v) {
            this._newtime = v
          }
      }
    , defaults: { enumerable: true, configurable: true,
        get: function() {
          return this._defaults||{}
        }
      }
    , vars: { enumerable: true, configurable: true,
        get: function() {
          return this._vars||{}
        }
      }
    , start: { enumerable: true, configurable: true,
        value: function(n) {
          this.reset()
          this._starttime = n
          this.isPlaying = true

          if (typeof this._start == 'function')
            this._start.call(this, n, this._startime - this.now)
        }
      }
    , play: { enumerable: true, configurable: true,
        value: function(n, e, d) {
          n = Date.now()
          e = n - this._starttime
          d = n - (this._last||n)

          this._last = n

          if(typeof this._play == 'function')
            this._play.call(this, n, e, d)
        }
      }
    , stop: { enumerable: true, configurable: true,
        value: function(n, e, d) {
          n = Date.now()
          e = n - this._starttime
          d = n - (this._last||n)

          this._last = n

          if (typeof this._stop == 'function')
            this._stop.apply(this, n, e, d)
          this.isPlaying = false
        }
      }
    , reset: { enumerable: true, configurable: true,
        value: function() {
          // replace _wars with defaults
          this._vars = JSON.parse(JSON.stringify(this.defaults))
          // in case of hackery
          this.time = this._time
          // delete this
          delete this._last

          if (typeof this._reset == 'function')
            this._reset.apply(this, some)
        }
      }
    , checkElapsed: { enumerable: true, configurable: true,
        value: function(n) {
          if (n - this._starttime >= this.time) {
            return true
          } else {
            return false
          }
        }
      }
  }
})

module.exports.Choose = klass(function(statics) {
  var MR = Math.random

  statics.random = function(seeds) {
    return 0|(MR()*seeds)
  }

  statics.pass = function(prob, r, c) {
    r = statics.random(100)
    c = r >= 100-prob
    return c
  }

  return {
      constructor: function(opts) {
        if (typeof opts == 'object')
          for (var k in opts) if (opts.hasOwnProperty(k))
            this['_'+k] = opts[k]
      }
    , now: { enumerable: true, configurable: true,
        get: function() {
          return Date.now()
        }
      }
    , every: { enumerable: true, configurable: true,
        get: function() {
          return this._every||1000
        }
      }
    , scenes: { enumerable: true, configurable: true,
        get: function() {
          return this._scenes||(this._scenes=[])
        }
      }
    , buffer: { enumerable: true, configurable: true,
        get: function() {
          return this._buffer||(this._buffer=[])
        }
      }
    , add: { enumerable: true, configurable: true,
        value: function(scene) {
          this.scenes.push(scene.uid)
        }
      }
    , choose: { enumerable: true, configurable: true,
        value: function(scene) {
          if (this.now < this._lastchoice + this.every)
            return

          this._lastchoice = this.now

          for (var i = this.scenes.length; i--;) {
            scene = Scene.getByUid(this.scenes[i])
            // check if scene is in buffer and check probability to be added to a buffer
            if (!~this.buffer.indexOf(this.scenes[i]) && statics.pass(scene.chance)) {
              scene.start(this.now)
              this.buffer.push(this.scenes[i])
            }
          }
        }
      }
    , play: { enumerable: true, configurable: true,
        value: function(n, e, d) {
          n = this.now
          e = n - this._start||(this._start=this.now)

          d = n - (this._last||n)

          this._last = n

          this.choose()

          if (typeof this._before == 'function')
            this._before()

          for (var i = this.buffer.length; i--;)
            void function(self, i, scene) {
              scene = Scene.getByUid(self.buffer[i])
              scene.play(n, e, d)

              // check if scene must be removed from buffer
              if (scene.checkElapsed(n)>0)
                self.buffer.splice(i, 1)
            }(this, i)
        }
      }
    , stop: { enumerable: true, configurable: true,
        value: function(n, e, d) {
          n = this.now
          e = n - this._start||(this._start=self.now)

          d = n - (this._last||n)

          for (var i = this.buffer.lenght; i--;)
            void function(self, i, scene) {
              scene = Scene.getByUid(self.buffer[i])

              scene.stop(n, e, d)
            }(this, i)

          delete this._start
          delete this._last
        }
      }
    , reset: { enumerable: true, configurable: true,
        value: function() {
          for (var i = this.scenes.lenght; i--;)
            void function(self, i, scene) {
              scene = Scene.getByUid(self.buffer[i])
              scene.reset()
            }(this, i)
        }
      }
  }
})
