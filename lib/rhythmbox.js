
var exec = require('child_process').exec
  , sys = require('sys')
  , http = require('http')
  , events = require("events")
//  , mdns = require('mdns')

var Rhythmbox = module.exports = exports = function Rhythmbox() {}
sys.inherits(Rhythmbox, events.EventEmitter);

Rhythmbox.prototype.change = function change(cmd, cb) {
  var self = this

  self.cmd(cmd, function() {
    self.changed(cb)
  })
}
Rhythmbox.prototype.changed = function changed(callback) {
  var self = this

  var cb = function (err, data) {
    if (typeof callback === 'function') callback(err, data)
  }

  self.current(function(err, data) {
    if (err) return cb(err)

    self.emit('change', data)
    cb(undefined, data)
  })
}
Rhythmbox.prototype.toggle = function toggle(cb) {
  this.playing = !this.playing
  this.change('play-pause', cb)
}
Rhythmbox.prototype.next = function next(cb) {
  this.playing = true
  this.change('next', cb)
}
Rhythmbox.prototype.prev = function prev(cb) {
  this.playing = true
  this.change('previous', cb)
}
Rhythmbox.prototype.volUp = function volUp() {
  this.cmd('volume-up')
}
Rhythmbox.prototype.volDown = function volDown() {
  this.cmd('volume-down')
}
Rhythmbox.prototype.mute = function mute() {
  if (this.muted) {
    this.muted = false
    this.cmd('unmute')
  } else {
    this.muted = true
    this.cmd('mute')
  }
}
Rhythmbox.prototype.current = function current(cb) {
  var self = this

  // typically 'info'... this is to prevent anything actually happening in the case of a mal-formed request
  self.cmd('print-playing-format="%ta;%tt;%td;%te"', function(err, data) {
    if (err) return cb(err)

    info = data.split(";")
    if (info.length > 1) {
      cb(undefined, {
        artist: info[0],
        title: info[1],
        duration: info[2],
        elapsed: info[3].trim(),
        playing: self.playing,
        playing_order: self.playing_order,
        muted: self.muted
      })
    } else cb(undefined, {
      artist: "",
      title: "",
      duration: 0,
      elapsed: 0,
      playing: self.playing,
      playing_order: self.playing_order,
      muted: self.muted
    })
  })
}
Rhythmbox.prototype.status = function status(cb) {
  var self = this

  self.cmd('status', function(data) {
    var changed = false
    if (data.muted !== self.muted) {
      self.muted = data.muted
      changed = true
    }
    if (data.playing !== self.playing) {
      self.playing = data.playing
      changed = true
    }
    if (data.playing_order !== self.playing_order) {
      self.playing_order = data.playing_order
      changed = true
    }

    if (changed) {
      self.changed()
    }
    if (typeof cb === 'function') cb(data)
  })
}
Rhythmbox.prototype.request = function request(method, cmd, cb) {
  var client = http.createClient(7000, 'localhost')
    , req = client.request(method, '/rest/' + cmd, {host: 'localhost'})

  req.on('response', function(res) {
    var body = ''
    res.on('data', function(chunk) {
      body += chunk
    })
    res.on('end', function() {
      var data = JSON.parse(body)
      cb(data)
    })
  })
  req.end()
}
Rhythmbox.prototype.cmd = function cmd(command, cb) {
  // distinguish rhythmbox-client and rhythmweb commands for now – @todo remove rhythmbox-client
  var self = this
    , web_cmds = ['status']
    , is_web_cmd = web_cmds.some(function(web_cmd) {
      return web_cmd === command
    })

  if (is_web_cmd) {
    self.request('GET', command, cb)
  } else {
    exec('rhythmbox-client --' + command, function(err, stdout, stferr) {
      if (err) {
        sys.puts(sys.inspect(err))
        return cb(err)
      }

      if (typeof cb === 'function') cb(undefined, stdout)
    })
  }
}
Rhythmbox.prototype.scan = function scan() {
  var ref = new mdns.capi.DNSServiceRef()
  sys.puts(sys.inspect(ref));

  var type = new mdns.RegType('daap')
  sys.puts(sys.inspect(type));
  sys.puts(sys.inspect(type.toString()));

  mdns.capi.dnsServiceBrowse(ref, 0, 0, type.toString(), null, function() {sys.puts(sys.inspect(arguments));}, null);

//  var browser = mdns.createBrowser('_daap')
//  browser.on('serviceUp', function(info, flags) {
//    sys.puts('up')
//    sys.puts(sys.inspect(arguments))
//  })
//  browser.on('serviceDown', function(info, flags) {
//    sys.puts('down')
//    sys.puts(sys.inspect(arguments))
//  })
//  browser.start()
}

exports.createClient = function() {
  var obj = new Rhythmbox()

  // @TODO find initial state
  obj.playing = false
  obj.muted = false
  obj.playing_order = 'linear-loop'

  setInterval(function() {
    obj.status()
  }, 5000)

  return obj
}

