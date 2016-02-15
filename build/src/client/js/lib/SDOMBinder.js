'use strict'

var UID = require('korbutJS/src/UID').UID
var singleton = require('korbutJS/src/class').singleton
var DOMHandler = require('./DOMHandler').DOMHandler

var SEventRouter = require('./SEventRouter').SEventRouter
var events = require('./SEventRouter').events
var eventRouter = new SEventRouter

module.exports.SDOMBinder = singleton(function(statics) {
  return {
      constructor: function(obj) {
        void function(self) {
          for (var k in obj) if(obj.hasOwnProperty(k))
            self[k] = obj[k]

          self.events = {}
        }(this)
      }
      , add: {
          value: function(domhandler, elems) {
            void function(self, dh, elems) {
              self.events[domhandler] = Object.create({}, {
                  ondispatch: {
                      value: function() {
                        var elems = self.events[domhandler].elements
                        for (var i = elems.length; i--;)
                          void function(elem) {
                            elem.removeEventListener(dh.type, dh.handler, dh.capture)
                          }(elems[i])
                      }
                  }
                , onready: {
                      value: function() {
                        var elems = self.events[domhandler].elements = typeof dh.selector == 'object' ?
                          [dh.selector] : document.querySelectorAll(dh.selector)

                        for (var i = elems.length; i--;)
                          void function(elem) {
                            elem.addEventListener(dh.type, dh.handler, dh.capture)
                          }(elems[i])
                      }
                  }
              })
              // remove on dispatch
              eventRouter.addRouteHandler(events.appwilldispatch, self.events[domhandler].ondispatch)
              // rebind on ready
              eventRouter.addRouteHandler(events.appready, self.events[domhandler].onready)
            }(this, DOMHandler.getByUid(domhandler))
          }
      }
    , remove: {
          value: function(domhandler) {
            void function(self) {
              // rem events
              self.events[domhandler].ondispatch()
              // remove on dispatch
              eventRouter.removeRouteHandler(events.appwilldispatch, self.events[domhandler].ondispatch)
              // rebind on ready
              eventRouter.removeRouteHandler(events.appready, self.events[domhandler].onready)
              // delete from events lists
              delete self.events[domhandler]
            }(this)
          }
      }
  }
})
