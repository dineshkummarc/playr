(function($) {
  var first = true

  io.setPath('/javascripts/socket.io/')

  var socket = new io.Socket(location.hostname == 'localhost' ? '127.0.0.1' : location.hostname)
  socket.connect()

  function send(cmd) {
    socket.send(JSON.stringify({cmd: cmd}))
  }

  socket.on('connect', function() {
    send('playlist')
  })

  socket.on('message', function(msg) {
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
        $('#player').show()
      }
    }
  })

  $(function(){

    $('#play').live('click', function(e) {
      e.preventDefault()
      send('play-pause')
    })
    $('#pause').live('click', function(e){
      e.preventDefault()
      send('play-pause')
    })
   $("#next").live('click', function(e){
      e.preventDefault()
      send('next')
    })
    $("#prev").live('click', function(e){
      e.preventDefault()
      send('prev')
    })
  })
})(jQuery)

