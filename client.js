const net = require('net');
const fs = require('fs');
const readline = require('readline');


PORT = 5555;

var sockets = [];


/** Client */

if (process.argv.length <= 2) {
  return console.error("File route  as a argument is needed");
}

fs.readFile(process.argv[2], 'utf8', function (err, data) {
  if (err) {
    return console.error(err);
  }
  var client = new net.Socket();
  client.connect(PORT, function () {
    console.log('Connected');
    client.write(data);
  });

  client.on('data', function (data) {
    console.log('Received: ' + data);
    client.end(); //kill client after server's response
  });

  client.on('end', function () {
    console.log('Connection end');
  });

  //process.exit();
});



