'use strict'

var klass = require('korbutJS/src/class').class
var SectionZView = require('./commons/SectionZView').SectionZView

var AccordionZView = require('./commons/AccordionZView').AccordionZView

var AccordionSkillsZView = AccordionZView.extend(function() {
  return {
      constructor: function() {
        AccordionZView.apply(this, arguments)
      }
    , _template: 'div.resumeh-accordion.resumeh-accordion--skills#$uid>\
      (h2.resumeh-accordion__title.resumeh-skills__header@title#$id>\
          span.resumeh-skills__title{$title})\
      +div.resumeh-accordion__content@content'
  }
})


module.exports.SkillsZView = klass(SectionZView, function(statics) {
  return {
      constructor: function() {
        SectionZView.apply(this, arguments)
        void function(self, headers, ps, arr) {
          arr = []
          Array.prototype.slice.apply(headers).forEach(function(item, i, title){
            title = (item.textContent||item.innerText)
            arr.push({
                title: title.trim()
              , id: item.id
            })
            item.parentNode.removeChild(item)
          })

          arr.forEach(function(item, i, acc, ul) {
            acc = new AccordionSkillsZView(item)
            acc.query('content').appendChild(ps[i])
            self.query('content').appendChild(acc.root)
          })
        }(this, this.root.querySelectorAll('h2'), this.root.querySelectorAll('h2+ul'))
      }
    , _template: SectionZView.makeTPL('skills')
    , _words: ['SKILLS', 'KNOW-HOW', 'SKILLS', 'CAN DO', 'SKILLS', 'FASTER']
  }
})
