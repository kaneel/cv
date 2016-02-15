'use strict'

const argv = require('minimist')(process.argv.slice(2));

// JS WEAKNESS
const markdownify = require('markdownify')
const partialify = require('partialify')

/* CSS MADNESS */
const cssnano = require('cssnano')
const postcss = require('postcss')
const autoprefixr = require('autoprefixer')
const browserslist = require('browserslist')
const atimport = require("postcss-import")
const media = require("postcss-custom-media")
const selector = require('postcss-custom-selectors')
const properties = require("postcss-custom-properties")

const normalize = require('postcss-normalize')
const pextend = require('postcss-extend')
const nested = require('postcss-nested')
const pcfor = require('postcss-for')

const colorHexAlpha = require("postcss-color-hex-alpha")
const colorFunction = require("postcss-color-function")

const b = require('browserify')
const util = require('util')
const fs = require('fs-extra')
const path = require('path')

const config = require('./config')

let watcher = 0

const cssarr = [
      atimport()
    , media()
    , selector()
    , properties()
    , colorFunction()
    , colorHexAlpha()
    , pextend()
    , pcfor()
    , nested()
    , autoprefixr()
  ]

if (!!argv.prod) cssarr.push(cssnano())

module.exports.make = function make(opts) {
  makeIndex(opts||{})
  makeCSS(opts||{})
  makeJS(opts||{})
}

var makeIndex = module.exports.makeIndex = function(opts) {
  fs.readFile(path.join(config.paths.src, 'client/index.html'), function(err, html, p) {
    if (err) return console.log('Index/Error', err)
    // replace two things
    html = html.toString().replace('%CSS%', !opts.prod ? 'client':'client.min').replace('%SCRIPT%', !opts.prod ? 'bundle':'bundle.min')
    p = path.join(config.paths.client, 'index.html')
    fs.open(p, 'w', function(err, css) {
      if (err) console.log('Index/Open Error', err)
      else fs.writeFile(p, html, function(err) {
          if (err) console.log('Index/Write Error', err)
          else console.log('Index/Written')
        })
    })
  })
}

var makeCSS = module.exports.makeCSS = function(opts, css, arr) {
  const file = !!opts.prod ? 'client.min' : 'client'
  fs.readFile(path.join(config.paths.src, 'client/css/client.css'), function(err, css) {
    if (err)
      fs.open(path.join(config.paths.root, `client/css/${file}.css`), 'w', function(err, css) {
        if (err) console.log('CSS/Open Error', err)
        go(css)
      })
    else go(css)
  })

  if (opts.watch)
    fs.watch(path.join(config.paths.src, 'client/css'), {recursive: true}, function(e) {
      console.log("CSS/",e)
      makeCSS({})
    })

  function go(css, to, top) {
    if (opts.prod) {
      to = path.join(config.paths.client, 'css/client.min.css')
    } else {
      to = path.join(config.paths.client, 'css/client.css')
    }

    postcss(cssarr)
      .process(css, { from: path.join(config.paths.src, 'client/css/client.css'), to: to, map: { inline: false } } )
      .then(function (result) {
        fs.writeFile(to, result.css, function(err){
          if (err) return console.log('CSS/Error', err)
          console.log('CSS/Built')
        })
        if ( result.map )
          fs.writeFile(path.join(config.paths.client, 'css/client.css.map'), result.map, function(err){
            if (err) return console.log('CSS/Map Error', err)
            console.log('CSS/Map Built')
          })
      })
      .catch(function(error) {
        console.log('CSS/Caught Error', error.stack)
      })
  }
}

var makeJS = module.exports.makeJS = function(opts, bopts, dirp) {
  if (opts.prod) bopts = {}
  else bopts = {debug:true}

  bopts.extensions = [ '.json', '.md', '.markdown', '.html']

  dirp = path.join(config.paths.client, 'js')

  // test dir
  fs.readdir(dirp, function(err){
    console.log('err readdir', err)
    if (err)
      fs.mkdirs(dirp, function (err) {
        if (err) console.log('Error dir/', dirp, err)
        goJS(dirp)
      })
    else
      goJS(dirp)
  })

  function goJS(dirp,ws) {
    const file = !!opts.prod ? 'bundle.min' : 'bundle'
    ws = fs.createWriteStream(path.join(dirp, `${file}.js`))
    ws.on('open', function(bf) {
      bopts.debug = true
      bf = b(path.join(config.paths.root, 'build/src/client/js'), bopts)
        .transform(markdownify)
        .transform(partialify)
        .bundle()
        .on('error', function(err){
          console.log('error while building js', err)
          this.emit('end')
        })
      bf.pipe(ws)
    })

    ws.on('finish', function() {
      console.log('JS/built')
      if (!!opts.watch){
        fs.watch(path.join(config.paths.root, 'build/src/client/js'), {recursive: true}, function(e) {
          console.log("JS/",e)
          makeJS({})
        })
        fs.watch(path.join(config.paths.root, 'build/src/client/md'), {recursive: true}, function(e) {
          console.log("MD/",e)
          makeJS({})
        })
      }
    })

    if (opts.prod)
      void function(ws) {
        ws.on('open', function(bf) {
          bopts.debug = false
          bf = b(path.join(config.paths.root, 'build/src/client/js'), bopts)
            .transform({
                global: true
              , ignore: [
                    '**/src/client/md/*'
                ]
            }, 'uglifyify')
            .transform(markdownify)
            .transform(partialify)
            .bundle()
            .on('error', function(err){
              console.log("ERR", err.message)
              this.emit('end')
            })
            .pipe(ws)
        })

        ws.on('finish', function() {
          console.log('JS/minifying js as well')
        })
      }(fs.createWriteStream(path.join(dirp, 'bundle.min.js')))
  }
}

makeIndex({prod: !!argv.prod, watch: !!argv.watch})
makeCSS({prod: !!argv.prod, watch: !!argv.watch})
makeJS({prod: !!argv.prod, watch: !!argv.watch})
