
/**
 * Module dependencies.
 */

var express = require('express')
  , sys = require('sys')
  , rhythmbox = require(__dirname + '/lib/rhythmbox').createClient()
  , app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.use(express.bodyDecoder());
  app.use(express.methodOverride());
  app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
  app.use(app.router);
  app.use(express.staticProvider(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

rhythmbox.scan()

// Routes

app.get('/', function(req, res) {
  res.render('index.jade', {
    locals: {
      title: 'Playr'
    }
  })
})

app.get('/play-pause', control)
app.get('/next', control)
app.get('/prev', control)
app.get('/info', control)

function control(req, res) {
    res.header('Content-Type', 'text/javascript');

    function onChange(err, data) {
        // error of some sort
        if (err) res.send('0')
        else {
            // info actually requires us returning something useful
            if (req.url.match(/^\/info/)) {
                res.send(req.query.callback+"(" + JSON.stringify(data) + ")");
            } else {
                res.send(req.query.callback+"()");
            }
        }
    }

    switch (req.params[0]){
        case "play-pause":
            rhythmbox.toggle(onChange)
            break;
        case "next":
            rhythmbox.next(onChange)
            break;
        case "prev":
            rhythmbox.prev(onChange)
            break;
        default:
            rhythmbox.current(onChange)
            break;
    }
}

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port)
}

