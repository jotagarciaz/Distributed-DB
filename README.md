# Distributed-DB
Project of DS course in MDH. It consist in 3 Middleware which write in 3 Databases and this databases should be concurrent. For this exercise only three variables of the DB are take in consideration which are A,B,C. But the code could be easily adjust to other requirements.

Files Description:

* server.js : is the middleware, it contains the configuration to connect to other servers, and the option to write in DB if a client or other server send updates.

* DB: is the file where the DB exist,

* operations: is the file which containes the operations that will be sent by the client, is prepare to make operations of type ASSIGN and ADD, the first one is followed by a variable (A,B,C) and a Integer. The latest one is followed by two variables and an interger.

For example:

ASSIGN B 5 (means for the DB B=5)
ADD A B 6 (means A=B+6)

* client.js: is the program which will be read the operations file and push it to the middleware (server.js)

