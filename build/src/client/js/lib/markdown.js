'use strict'

var marked = module.exports.marked = require('marked')
var renderer = new marked.Renderer()

module.exports.convertToHTML = function(string, frag, parser, results) {
  frag = document.createDocumentFragment()
  parser = new DOMParser()
  results = parser.parseFromString(marked(string), 'text/html')
  Array.prototype.slice.call(results.body.children).forEach(function(item) {
    frag.appendChild(item)
  })

  return frag
}

marked.setOptions({
  renderer: renderer,
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  smartLists: true,
  smartypants: false
})

renderer.heading = function (text, level) {
  var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');

  return '<h' + level + '><a name="' +
                escapedText +
                 '" class="mnmsknl-post__header-anchor" href="#' +
                 escapedText +
                 '">¶</a>' +
                  text + '</h' + level + '>';
}

// renderer.image = function (href, title, text) {
//   return '<figure>\
//       <img src="' + href +'" alt="' + text + '">\
//       <figcaption>' + title + '</figcaption>\
//     </figure>'
// }
