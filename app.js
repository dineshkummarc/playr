
/**
 * Module dependencies.
 */

var express = require('express')
  , sys = require('sys')
  , urls = require('url')
  , io = require('socket.io')
  , rhythmbox = require(__dirname + '/lib/rhythmbox').createClient()
  , app = module.exports = express.createServer()

// Configuration

app.configure(function() {
  app.set('views', __dirname + '/views')
  app.use(express.bodyDecoder())
  app.use(express.methodOverride())
  app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }))
  app.use(app.router)
  app.use(express.staticProvider(__dirname + '/public'))
})

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
})

app.configure('production', function(){
  app.use(express.errorHandler())
})

//rhythmbox.scan()

// Routes

app.get('/', function(req, res) {
  res.render('index.jade', {
    locals: {
      title: 'Playr'
    }
  })
})

// Websocket Server
var socket = io.listen(app)

rhythmbox.on('change', function(data) {
  socket.broadcast(JSON.stringify({type:'playlist', data: data}))
})

socket.on('connection', function(client) {
  client.broadcast(JSON.stringify({content: 'New User!'}))

  client.on('message', function(data) {
    data = JSON.parse(data)
    if (typeof data.cmd !== 'undefined') {
      switch (data.cmd) {
        case "play-pause":
          rhythmbox.toggle()
          break
        case "next":
          rhythmbox.next()
          break
        case "prev":
          rhythmbox.prev()
          break
        case "volUp":
          rhythmbox.volUp()
          break
        case "volDown":
          rhythmbox.volDown()
          break
        case "playlist":
          rhythmbox.current(function(err, data) {
            if (err) return sys.puts(sys.inspect(err))
            client.send(JSON.stringify({type:'playlist', data: data}))
          })
          break
      }
    }
  })
})

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000)
  console.log("Express server listening on port %d", app.address().port)
}

