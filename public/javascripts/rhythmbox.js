io.setPath('/javascripts/socket.io/')

function Rhythmbox() {}
Rhythmbox.create = function create(options) {
  var self = new this()
  self.host = location.hostname == 'localhost' ? '127.0.0.1' : location.hostname
  return self
}
Rhythmbox.prototype.connect = function connect() {
  var first = true
    , self = this

  self.socket = new io.Socket()

  self.socket.connect()

  self.socket.on('connect', function onConnect() {
    self.send('playlist')
  })

  self.socket.on('message', function(msg) {
    msg = JSON.parse(msg)
    if (msg.type === 'playlist') {
      if (msg.data.artist === '') $('#title').text('Not playing')
      else {
        $('#artist').text(msg.data.artist)
        $('#title').text(msg.data.title)
      }
      if (msg.data.playing) {
        $('#play').hide()
        $('#pause').show()
      } else {
        $('#play').show()
        $('#pause').hide()
      }
      if (first) {
        first = false
        $('#loader').hide()
        $('#alert').hide()
        $('#player').show()
      }
    }
  })
  self.socket.on('disconnect', function() {
    $('#player').hide()
    $('#loader').show()
    $('#alert').show()
  })
}
Rhythmbox.prototype.send = function send(cmd) {
  this.socket.send(JSON.stringify({cmd: cmd}))
}

