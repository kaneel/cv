'use strict'

var UID = require('korbutJS/src/UID').UID
var klass = require('korbutJS/src/class').class

module.exports.DOMHandler = klass(function(statics, events) {
  events = {}

  statics.getByUid = function(uid) {
    return events && events[uid].instance
  }

  return {
      constructor: function(obj) {
        obj.capture = obj.capture||false
        void function(self) {
          events[self.uid] = { instance: self }

          for (var k in obj) if(obj.hasOwnProperty(k))
            self[k] = obj[k]

          // for event delegation
          if (typeof obj.delegate != 'undefined')
            void function() {
              self.selector = obj.delegate
              self.delegatedselector = obj.selector
              self.delegatedhandler = obj.handler
              self.handler = function(e, allElements, found) {
                allElements = document.querySelectorAll(self.delegatedselector)

                if(!allElements.length) return

                found = []

                for (var i = allElements.length; i--;)
                  void function(element) {
                    element = e.target
                    while(element) {
                      if (element === allElements[i]) {
                        found.push(element)
                        break
                      }
                      element = element.parentNode
                    }
                  }()

                e.delegatedTarget = self.selector

                for (var i = found.length; i--;)
                  void function(elem) {
                    e.realtarget = elem
                    self.delegatedhandler(e)
                  }(found[i])
              }

            }()
        }(this)
      }
    , uid: {
          get: function() {
            return this._uid||(this._uid = UID.uid(), this._uid)
          }
      }
  }
})
