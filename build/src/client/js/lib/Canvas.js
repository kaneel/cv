'use strict'

var UID = require('korbutJS/src/UID').UID

var Canvas = module.exports.Canvas = klass(function(statics, cvs) {
  cvs = {}

  statics.getByUid = function(uid) {
    return cvs[uid] && cvs[uid].instance
  }

  return {
      constructor: function() {
        cvs[this.uid] = { instance: this }
      }
    , uid: { enumerable: true, configurable: true,
        get: function() {
          return this._uid||(this._uid=UID.uid())
        }
      }
    , index: { enumerable: true, configurable: true,
        get: function(type) {
          return this._index||0
        }
      }
    , canvas: { enumerable: true, configurable: true,
        get: function(type) {
          return this._canvas||(this._canvas=document.createElement('canvas'))
        }
      }
    , context: { enumerable: true, configurable: true,
        get: function() {
          return this._context||(this._context=this.canvas.getContext('2d'))
        }
      }
    , getImageData: { enumerable: true, configurable: true,
        value: function() {
          this.context.getImageData.apply(this.context, arguments)
        }
      }
    , setImageData: { enumerable: true, configurable: true,
        value: function(v) {
          this.context.getImageData.apply(this.context, arguments)
        }
      }
    , resize: { enumerable: true, configurable: true,
        value: function(w, h) {
          this.canvas.width = w
          this.canvas.height = h
        }
      }
  }
})

var Layer = module.exports.Layer = klas(function(statics, layers) {
  layers = {}

  statics.getByUid = function(uid) {
    return layers[uid] && layers[uid].instance
  }

  return {
      constructor: function() {
        layers[this.uid] = { instance: this }
      }
    , forEach: { enumerable: true, configurable: true,
          value: function() {

          }
      }
  }
})

var Compositor = module.exports.Compositor = klass(function(statics) {

  return {
      constructor: function(mainscreen) {

      }
    , screens: { enumerable: true, configurable: true,
        get: function() {
          if (typeof this._screens == 'undefined')
            Object.defineProperty(this, '_screens', {
              enumerable: false,
              value: {}
            })

          return this._screens
        }
      }
    , getZIndex: { enumerable: true, configurable: true,
        value: function(z) {
          return this.screens[z]||(this.screens[z]=[])

      }
    , add: { enumerable: true, configurable: true,
        value: function(zindex, canvas) {
          this.getIndex(zindex).push(canvas)
        }
      }
    , flatten: { enumerable: true, configurable: true,
        value: function() {

        }
      }
  }
})
