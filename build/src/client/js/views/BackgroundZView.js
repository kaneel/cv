'use strict'

var ZView = require('korbutJS/src/dom/ZView').ZView
var UID = require('korbutJS/src/UID').UID
var Promise = require('korbutJS/src/Promise').Promise
var rAF = require('korbutJS/src/dom/requestAnimationFrame').requestAnimationFrame
var cAF = require('korbutJS/src/dom/requestAnimationFrame').cancelAnimationFrame

var docEl = document.documentElement

var SEventRouter = require('../lib/SEventRouter')
var eventRouter = new SEventRouter.SEventRouter
var events = SEventRouter.events

var stylesheet = require('../lib/stylesheet').stylesheet
var getCompat = require('../lib/stylesheet').getCompat
var std_transition = require('../lib/stylesheet').std_transition
var CSS_TRANSITION_PROPERTY = require('../lib/stylesheet').CSS_TRANSITION_PROPERTY

var Choose = require('../lib/ChooseTL').Choose
var Scene = require('../lib/ChooseTL').Scene

var color1 = 'rgba(255, 255, 255, %transp%)'
var color2 = 'rgba(255, 255, 255, %transp%)'
var color3 = 'rgba(255, 255, 255, %transp%)'

var Scene1 = Scene.extend(function(statics) {
  return {
      constructor: function() {
        Scene.apply(this, arguments)
      }
    , _defaults: {
          transp1: 1
        , transp2: 0.5
        , transp3: 0.25
        , rectsize: 0.0
        , rectsize2: 0.0
        , rectsize3: 0.0
      }
  }
})

var Scene2 = Scene.extend(function(statics) {
  return {
      constructor: function() {
        Scene.apply(this, arguments)
      }
    , _defaults: {
          transp1: 1
        , transp2: 0.5
        , transp3: 0.25
        , rectsize: 0.0
        , rectsize2: 0.0
        , rectsize3: 0.0
      }
  }
})

var utils = require('../lib/utils')

module.exports.BackgroundZView = ZView.extend(function(statics) {
  statics.calculate = function(w, h, ratio) {
    w = docEl.clientWidth
    h = docEl.clientHeight
    ratio = w >= h ? h/w : w/h

    if (w >= h)
      return {
          width: 800
        , height: 0|(800*ratio)
        , csswidth: '100%'
        , cssheight: 'auto'
      }
    else
      return {
          width: 0|(800*ratio)
        , height: 800
        , csswidth: 'auto'
        , cssheight: '100%'
      }
  }

  return {
      constructor: function(dict, args, newdict) {
        args = Array.prototype.splice.call(arguments)
        newdict = statics.calculate()||{}
        dict = args[0]||{}

        for (var k in newdict) if (newdict.hasOwnProperty(k))
          dict[k] = newdict[k]

        args[0] = dict

        ZView.apply(this, args)

        this.model.setItem('uid', this.uid)

        void function(self) {
          self.lastTick = self.now

          self._cssReady = new Promise(function(resolve) {
            getCompat(function(properties){
              stylesheet.insertRule(
                  ['#', self.uid, '{}'].join('')
                , ['#', self.uid, ' canvas{}'].join('')
                , function(neh, main, rule) {
                    rule.setProperty('width', self.model.getItem('csswidth'))
                    rule.setProperty('height', self.model.getItem('cssheight'))

                    self.model.addEventListener('update', function() {
                      rule.setProperty('width', self.model.getItem('csswidth'))
                      rule.setProperty('height', self.model.getItem('cssheight'))
                    })

                    var cv = self.query('canvas')
                    var ctx = self.context

                    var tl = new Choose({
                        every:1000
                      , before: function() {
                          cv.height = cv.height
                        }
                    })

                    var s1 = new Scene1({
                        time: 3000
                      , chance: 50
                      , play: function(n, e, d) {
                          ctx.rotate(45 * Math.PI / 180)

                          if (e>1000) {
                            this.vars.transp1 -= 0.15
                            this.vars.transp2 -= 0.05
                            this.vars.transp3 -= 0.01
                          }

                          ctx.fillStyle = color1.replace('%transp%', this.vars.transp1)

                          ctx.fillRect(0, 0, this.vars.rectsize, 20)

                          if (e < 1000)
                            this.vars.rectsize += 4+d

                          if (e > 200) {
                            ctx.fillStyle = color2.replace('%transp%', this.vars.transp2)
                            ctx.fillRect(0, 20, this.vars.rectsize2, 20)
                            if (e < 1000)
                              this.vars.rectsize2 += 12+d
                          }

                          if (e > 400) {
                            ctx.fillStyle = color3.replace('%transp%', this.vars.transp3)
                            ctx.fillRect(0, 40, this.vars.rectsize3, 20)
                            if (e < 1000)
                              this.vars.rectsize3 += 18+d
                          }

                          ctx.rotate(-45 * Math.PI / 180)
                        }
                      , stop: function(n, d, e) {
                          cv.height = cv.height
                        }
                    })

                    var s2 = new Scene2({
                        time: 3000
                      , chance: 10
                      , play: function(n, e, d) {
                        ctx.translate(cv.width / 2, -60)
                          ctx.rotate(45 * Math.PI / 180)

                          if (e>1000) {
                            this.vars.transp1 -= 0.15
                            this.vars.transp2 -= 0.05
                            this.vars.transp3 -= 0.01
                          }

                          ctx.fillStyle = color1.replace('%transp%', this.vars.transp1)

                          ctx.fillRect(0, 0, this.vars.rectsize, 20)

                          if (e < 1000)
                            this.vars.rectsize += 4+d

                          if (e > 200) {
                            ctx.fillStyle = color2.replace('%transp%', this.vars.transp2)
                            ctx.fillRect(0, 20, this.vars.rectsize2, 20)
                            if (e < 1000)
                              this.vars.rectsize2 += 12+d
                          }

                          if (e > 400) {
                            ctx.fillStyle = color3.replace('%transp%', this.vars.transp3)
                            ctx.fillRect(0,  40, this.vars.rectsize3, 20)
                            if (e < 1000)
                              this.vars.rectsize3 += 18+d
                          }

                          ctx.translate(-cv.width / 2, 60)
                          ctx.rotate(-45 * Math.PI / 180)
                        }
                      , stop: function(n, d, e) {
                          cv.height = cv.height
                        }
                    })

                    tl.add(s1)
                    tl.add(s2)

                    rAF(render)

                    function render() {
                      rAF(render)
                      tl.play() // !!!
                    }
                  }
              )
            })
          })
          eventRouter.addRouteHandler(events.viewportresize, function(e, n, s) {
            self.model.setItem(statics.calculate())
            n()
          })
        }(this)
      }
    , _template: '.resumeh-background#$uid>canvas@canvas[width=$width][height=$height]'
    , uid: { enumerable: true, configurable: true,
          get: function(){ return this._uid || Object.defineProperty(this, "_uid", { value: UID.uid() })._uid }
      }
    , now: { enumerable: true, configurable: true,
          get: function() {
            return Date.now()
          }
      }
     , context: { enumerable: true, configurable: true,
          get: function() {
            return this._context2d||(this._context2d = this.query('canvas').getContext('2d'), this._context2d)
          }
      }
    , imageData: { enumerable: true, configurable: true,
          get: function() {
            // console.log(this.context.getImagedata)
            // return this.context.getImagedata.apply(this.context, arguments)
          }
        , set: function(d) {
            return this.context.setImagedata.apply(this.context, arguments)
          }
      }
  }
})
