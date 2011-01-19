(function($) {
  var playr = Rhythmbox.create()
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

