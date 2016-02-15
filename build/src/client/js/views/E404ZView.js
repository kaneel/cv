'use strict'

var klass = require('korbutJS/src/class').class
var SectionZView = require('./commons/SectionZView').SectionZView

module.exports.E404ZView = klass(SectionZView, function(statics) {
  return {
      constructor: function() {
        SectionZView.apply(this, arguments)
      }
    , _template: SectionZView.makeTPL('e404')
    , _words: ['404', 'ERRR', '404', 'ERR404', '404', 'PBCAK']
  }
})
