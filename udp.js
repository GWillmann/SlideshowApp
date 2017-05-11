import base64 from 'base64-js';
import dgram from 'dgram';

// only works for 8-bit chars
function toByteArray(obj) {
  var uint = new Uint8Array(obj.length);
  for (var i = 0, l = obj.length; i < l; i++){
    uint[i] = obj.charCodeAt(i);
  }

  return new Uint8Array(uint);
};

export class Client {

  constructor() {
    let self = this;
    this.socket = dgram.createSocket('udp4');
    this.socket.bind(10000, function() {
      self.socket.setBroadcast(true);
      self.findUdpServer('whois;');
    });
    
    this.CLIENT_PORT = 10000;
  };

  setServerAddress(address) {
    this.ADDR = address;
  }

  findUdpServer(text, callback) {
    let self = this;
    var msg=toByteArray(text);
    self.socket.send(msg, 0, msg.length, this.CLIENT_PORT, '255.255.255.255', callback)
  }

  sendUdpPacket(text, callback) {
    let self = this;
    var msg=toByteArray(text);
    self.socket.send(msg, 0, msg.length, this.CLIENT_PORT, this.ADDR, callback)
  };


}

export class Server {
  constructor() {
    this.socket = dgram.createSocket('udp4');
    this.SERVER_PORT = 10001;

    this.socket.bind(this.SERVER_PORT, function(err) {
      if (err) throw err;
    })
  };

  listen(callback) {
    this.socket.on('message', function(data, rinfo) {
      var str = String.fromCharCode.apply(null, new Uint8Array(data));
      callback(str, rinfo);
    })
  }
}


