'use strict'

var klass = require('korbutJS/src/class').class
var SectionZView = require('./commons/SectionZView').SectionZView

var AccordionZView = require('./commons/AccordionZView').AccordionZView

var AccordionExpZView = AccordionZView.extend(function() {
  return {
      constructor: function() {
        AccordionZView.apply(this, arguments)
      }
    , _template: 'div.resumeh-accordion.resumeh-accordion--exp#$uid>\
        (h2.resumeh-accordion__title.resumeh-exp__header@title#$id>\
          span.resumeh-exp__date{$date} + §{ } + span.resumeh-exp__separator{-} +  §{ } + span.resumeh-exp__title{$title})\
      +div.resumeh-accordion__content@content'
  }
})

module.exports.ExpZView = klass(SectionZView, function(statics) {
  return {
      constructor: function() {
        SectionZView.apply(this, arguments)

        void function(self, headers, ps, arr) {
          arr = []
          Array.prototype.slice.apply(headers).forEach(function(item, i, title){
            title = (item.textContent||item.innerText).split('^')
            arr.push({
                date: title[0].trim()
              , title: title[1].trim()
              // , agency: title[2].trim()
              , id: item.id
            })
            item.parentNode.removeChild(item)
          })

          arr.forEach(function(item, i, acc, ul) {
            acc = new AccordionExpZView(item)
            acc.query('content').appendChild(ps[i])
            self.query('content').appendChild(acc.root)
          })
        }(this, this.root.querySelectorAll('h2'), this.root.querySelectorAll('h2+ul'))
      }
    , _template: SectionZView.makeTPL('exp')
    , _words: ['EXPERIENCE', 'PREVIOUS', 'EXPERIENCE', 'WHERE', 'EXPERIENCE', 'ROLES']
  }
})
