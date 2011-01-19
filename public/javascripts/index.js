(function($) {
  var playr = Playr.create()
  playr.connect()

  $(function(){
    $('#play').live('click', function(e) {
      e.preventDefault()
      playr.send('play-pause')
    })
    $('#pause').live('click', function(e){
      e.preventDefault()
      playr.send('play-pause')
    })
    $(document).keydown(function(e) {
      if (e.keyCode == '32') playr.send('play-pause')
      if (e.keyCode == '37') playr.send('prev')
      if (e.keyCode == '39') playr.send('next')
      if (e.keyCode == '43') playr.send('volUp')
      if (e.keyCode == '45') playr.send('volDown')
      if (e.keyCode == '77') playr.send('mute')
    })
    $("#next").live('click', function(e){
      e.preventDefault()
      playr.send('next')
    })
    $("#prev").live('click', function(e){
      e.preventDefault()
      playr.send('prev')
    })
    $("#volUp").live('click', function(e){
      e.preventDefault()
      playr.send('volUp')
    })
    $("#volDown").live('click', function(e){
      e.preventDefault()
      playr.send('volDown')
    })
    $("#alert a").live('click', function(e) {
      e.preventDefault()
      playr.connect()
    })
  })
})(jQuery)

