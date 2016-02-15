'use strict'

var klass = require('korbutJS/src/class').class
var SectionZView = require('./commons/SectionZView').SectionZView

module.exports.AboutZView = klass(SectionZView, function(statics) {
  return {
      constructor: function(dict) {
        SectionZView.apply(this, arguments)
      }
    , _template: SectionZView.makeTPL('about')
    , _words: ['ABOUT', 'FOLLOW', 'ABOUT', 'SHARE', 'ABOUT', 'READ']
  }
})
