/* This is our server. Its main functionality consists of acting as the middleware
   of our distributed system, updating all databases unanimously. 
 */
fs = require('fs')
net = require('net')
//IP and ports need to be hardcoded for other computers
HOST2 = "10.132.136.26"; //IP of one of the other computers
HOST3 = "10.132.136.140"; //IP of the third computer
PORT_CLIENT = 5555; //port we use to communicate with the client
PORT_SERVIDOR_1 = 7777; //port that other computers use to communicate with this one
PORT_SERVIDOR_2 = 6666; //port this computer uses to communicate with other computer
PORT_SERVIDOR_3 = 8888; //port this computer uses to communicate with the third computer

var client = [];
var servers = [];
var myTime;
let dirtyBits = { "a": 0, "b": 0, "c": 0 }; //to know which variables is going to be touched.
// make a dictionary to block and unlock variables

server_counter = 0;
a = 0;
b = 0;
c = 0;

var fail = 0;
/* The server takes care of the client first.
 */
var s = net.Server(function (socket) {
  // Add the new client socket connection to the array of client

  client.push(socket);
  // 'data' is an event that means that a message was just sent by the client application

  socket.on('data', function (msg_sent) {

    console.info("Client sending data");
    connect_server(msg_sent, HOST2, PORT_SERVIDOR_2);
    connect_server(msg_sent, HOST3, PORT_SERVIDOR_3);
    socket.end();
  });

  socket.on('end', () => {
    console.log('Client disconnected from server');
  });
});

/** Server takes care of the other servers */
var r = net.Server(function (socket) {
  // Add the new client socket connection to the array of client
  // 'data' is an event that means that a message was just sent by the client application

  socket.on('data', function (msg_sent) {
    json = JSON.parse(msg_sent.toString());
    if (json.hasOwnProperty("message") && json.hasOwnProperty('dirtyBits') && json.globalCommit !== true) {
      let commit = true;
      json.dirtyBits.forEach((element, index) => {
        if (element === 1) {
          if (dirtyBits[element] === 0) {
            dirtyBits[element] = 1;
          } else {
            commit = false;
            for (let i = 0; i == index; i++) {
              dirtyBits[i] = 0;
            }
          }
        }
      });
      if (commit) {
        json.commit = true;
      } else {
        json.commit = false;
        socket.end();
      }
      socket.write(JSON.stringify(json));
    }
    if (json.globalCommit) {
      writeDB(json.message);
      json.dirtyBits.forEach((element) => {
        if (element === 1) {
          dirtyBits[element] = 0;
        }
      });
      socket.end();
    }


  });

  socket.on('end', () => {
    console.log('Server disconnected from server');
  });
});


function reconnect(msg_sent){
  console.log("impossible to connect");
  clearTimeout(myTime);
  console.log(servers.length);
  
  if(servers.length===0 && fail > 1){
    writeDB(msg_sent);
    fail = 0;
  }
}

//FUNCTION THAT CONNECTS WITH SERVERS

var trys=20;
function connect_server(msg_sent, hst, prt) {
  var server_2 = new net.Socket();
  server_2.connect(prt, hst, function () {
    console.log('Connected');
    servers.push(server_2);
    let envio = JSON.stringify({ "message": msg_sent.toString(), "dirtyBits": [dirtyBits], "commit": true, "globalCommit": false });
    server_2.write(envio);
  });

  server_2.on('data', function (data) {
    json = JSON.parse(data.toString());
    fail = 0;
    if (json.commit) {
      
      server_counter = server_counter + 1;
      if (server_counter === servers.length) {
        writeDB(json.message);
        server_counter = 0;
        dirtyBits = { "a": 0, "b": 0, "c": 0 };
        console.log("write succesful");
        json.globalCommit = true;
        var resulted = JSON.stringify(json);
        while (servers.length > 0) {
          let serveraux = servers.pop();
          serveraux.write(resulted);
          serveraux.end();
        }

      }

    } else {
      console.assert("No commit.");
      server_2.end(); //kill client after server's response
    }


  });

  server_2.on('end', function () {
    console.log('Connection end');

  });
  server_2.on('error', function () {
    console.log('Connection fail.');
    
    if(trys===0){
      fail++;
      myTime= setTimeout(reconnect,5000,msg_sent);
    }else{
      trys--;
    connect_server(msg_sent, hst, prt);
    }
  });
}
// FUNCTION WRITE
function writeDB(msg_sent) {


  var lines = msg_sent.toString().split('\n'); //DEPENDE DEL S.O. puede ser \n , \r o \n\r


  for (line of lines) {
    if (line.match(/ASSIGN A (-?\d*)/i) || line.match(/ADD A (A|B|C) (-?\d*)/i)) {
      dirtyBits['a'] = 1;
    }
    if (line.match(/ASSIGN B (-?\d*)/i) || line.match(/ADD B (A|B|C) (-?\d*)/i)) {
      dirtyBits['b'] = 1;
    }
    if (line.match(/ASSIGN C (-?\d*)/i) || line.match(/ADD C (A|B|C) (-?\d*)/i)) {
      dirtyBits['c'] = 1;
    }
  }

  for (line of lines) {

    if (aux = line.match(/ASSIGN A (-?\d*)/i)) {
      if (aux !== null) {
        a = parseInt(aux[1]);
      }
    } else {
      if (aux = line.match(/ADD A (A|B|C) (-?\d*)/i)) {
        if (aux !== null) {
          let add = 0;
          switch (aux[1]) {
            case 'A':
              add = a;
              break;
            case 'B':
              add = b;
              break;
            case 'C':
              add = c;
              break;
          }
          a = parseInt(add) + parseInt(aux[2]);
        }
      } else {
        if (aux = line.match(/ASSIGN B (-?\d*)/i)) {
          if (aux !== null) {
            b = parseInt(aux[1]);
          }
        } else {
          if (aux = line.match(/ADD B (A|B|C) (-?\d*)/i)) {
            if (aux !== null) {
              let add = 0;
              switch (aux[1]) {
                case 'A':
                  add = a;
                  break;
                case 'B':
                  add = b;
                  break;
                case 'C':
                  add = c;
                  break;
              }
              b = parseInt(add) + parseInt(aux[2]);
            }
          } else {
            if (aux = line.match(/ASSIGN C (-?\d*)/i)) {
              if (aux !== null) {
                c = parseInt(aux[1]);
              }
            } else {
              if (aux = line.match(/ADD C (A|B|C) (-?\d*)/i)) {
                if (aux !== null) {
                  let add = 0;
                  switch (aux[1]) {
                    case 'A':
                      add = a;
                      break;
                    case 'B':
                      add = b;
                      break;
                    case 'C':
                      add = c;
                      break;
                  }
                  c = parseInt(add) + parseInt(aux[2]);
                }
              }
            }
          }
        }
      }
    }
  }
  fs.writeFile("DB", `A = ${a}\nB = ${b}\nC = ${c}`, function (err) {
    if (err) {
      return console.error(err);
    }

  });

}

//FUNCTION READ
function readDB() {

  fs.readFile("DB", 'utf8', function (err, data) {
    if (err) {
      return console.error("DB doesn't exist, so no data read it.");
    }
    var lines = data.toString().split('\n');
    for (line of lines) {
      if (result = line.match(/A = (-?\d*)/i)) {
        if (result !== null) {
          a = parseInt(result[1]);
        }
      }
      if (result = line.match(/B = (-?\d*)/i)) {
        if (result !== null) {
          b = parseInt(result[1]);
        }
      }
      if (result = line.match(/C = (-?\d*)/i)) {
        if (result !== null) {
          c = parseInt(result[1]);
        }
      }

    }
  });

}
readDB();
s.listen(PORT_CLIENT);
r.listen(PORT_SERVIDOR_1);



