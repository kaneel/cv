'use strict'

var SS = require('korbutJS/src/dom/Stylesheet').Stylesheet

var stylesheet = new SS

module.exports.stylesheet = stylesheet

var COMPUTED_STYLE_COMPAT = module.exports.COMPUTED_STYLE_COMPAT = "getComputedStyle" in window ? 1 : 0
var CSS_TRANSITION_COMPAT = module.exports.CSS_TRANSITION_COMPAT = COMPUTED_STYLE_COMPAT /*&& "DOMStringMap" in window*/ && "TransitionEvent" in window ? 1 : "WebKitTransitionEvent" in window ? 3 : 0
var CSS_TRANSITION_PROPERTY = module.exports.CSS_TRANSITION_PROPERTY = CSS_TRANSITION_COMPAT == 1 ? "transition" : CSS_TRANSITION_COMPAT == 3 ? "-webkit-transition" : null
var CSS_TRANSITIONEND_EVENT = module.exports.CSS_TRANSITIONEND_EVENT = CSS_TRANSITION_COMPAT == 1 ? "transitionend" : CSS_TRANSITION_COMPAT == 3 ? "webkitTransitionEnd" : null

module.exports.std_transition = function(str, prop){
    return str.replace("transform", prop)
}


module.exports.getCompat = module.exports.cssCompat = function(p){
    p = new Promise(function(resolve, reject) {
      stylesheet.insertRule(
          ".test-a{position:fixed; width:400px; height: 100px; background: red; z-index: 10000;}"
        , ".test-b{position:sticky; position:-webkit-sticky}"
        , ".test-c{-webkit-overflow-scrolling:touch}"
        , ".test-d{transform:translate(0, 0);-webkit-transform:translate(0, 0)}"
        , ".test-e{backface-visibility:hidden; -webkit-backface-visibility:hidden;}"
        , ".test-f{perspective:1000; -webkit-perspective:1000;}"
        , function(neh, a, b, c, d, e, f){
            try {
              resolve({
                  fixed: a.getProperty("position")
                , sticky: b.getProperty("position")
                , overflow_scrolling_touch: c.getProperty("-webkit-overflow-scrolling")
                , transform: d.getProperty("transform") ? "transform"
                           : d.getProperty("-webkit-transform") ? "-webkit-transform"
                           : null
                , backfaceVisibility: e.getProperty('backface-visibility') ? 'backface-visibility'
                                    : e.getProperty('-webkit-backface-visibility') ? '-webkit-backface-visibility'
                                    : null
                , perspective: f.getProperty('perspective') ? 'perspective'
                             : f.getProperty('-webkit-perspective') ? '-webkit-perspective'
                             : null
              })
            } catch(e) { reject(e) }
          }
      )
    })

    return function(cb) {
      return p.then(cb, noop).catch(noop)
    }

    function noop(e) {
      console.log('OH NOEZ GETCOMPAT', e)
    }
}()
