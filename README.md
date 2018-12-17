# Distributed Database

This is a project we have created for the Distributed Systems course in Mälardalen University Västerås and Eskilstuna, Sweden. It consists of three nodes, consisting each of a client, a middleware and a database. The client sends a transaction to the middleware, which handles it and sends it to all three databases, so that they are always consistent. 

For this exercise, only three variables of the database are taken into consideration: A, B, and C. But the code could easily be adjusted to fit other requirements. 

## Files Description:

* server.js : is the middleware. It contains the configuration to connect to other servers, and the option to write in DB if a client or other server send updates.

* DB: is the file where the DB exists.

* operations: is the file which contains the operations that will be sent by the client; the "transaction". It is prepared to make operations of type ASSIGN and ADD. The first one is followed by a variable (A,B,C) and a Integer. The latter one is followed by two variables and an interger.

For example:

ASSIGN B 5 (means for the DB B=5)
ADD A B 6 (means A=B+6)

* client.js: is the program which will read the operations file and push it to the middleware (server.js)

## Execution:

This code was develop in node.js so to execute it:

1. Edit server.js and change the IPs, and the ports, for yours IPs and ports.
2. Open DB and configure it with the initial values of the Variables. You can also delete it, and a new one will be created, when it is needed.
3. Open a terminal and execute node server like so:
node server.js
4. Edit operations for your prefered ones.
5. Execute client.js, open another terminal,write the command: 
  node client.js operations
