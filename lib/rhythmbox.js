
var exec = require('child_process').exec
  , sys = require('sys')
//  , mdns = require('mdns')

var Rhythmbox = module.exports = exports = function Rhythmbox() {}
Rhythmbox.prototype.toggle = function toggle(cb) {
    this.cmd('play-pause', cb)
}
Rhythmbox.prototype.next = function next(cb) {
    this.cmd('next', cb)
}
Rhythmbox.prototype.prev = function prev(cb) {
    this.cmd('prev', cb)
}
Rhythmbox.prototype.current = function current(cb) {
    // typically 'info'... this is to prevent anything actually happening in the case of a mal-formed request
    this.cmd('print-playing-format="%ta;%tt;%td;%te"', function(err, data) {
        if (err) return cb(err)

        info = data.split(";");
        if (info.length > 1) {
            cb(undefined, {
                artist: escape(info[0]),
                title: escape(info[1]),
                duration: info[2],
                elapsed: info[3].trim()
            })
        } else {
            cb()
        }
    })
}
Rhythmbox.prototype.cmd = function cmd(command, cb) {
    exec('rhythmbox-client --' + command, function(err, stdout, stferr) {
        if (err) {
            sys.puts(sys.inspect(err))
            return cb(err)
        }

        cb(undefined, stdout)
    })
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
  return new Rhythmbox()
}

