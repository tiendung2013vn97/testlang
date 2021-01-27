/**
* This file is for running multi processors for production
* @requrie {cluster}
*/
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;
const Server = require('./server');
const Croner = require('./croner');
/*test */
if (cluster.isMaster) {
    masterProcess();
}else {
    childProcess();  
}

function masterProcess() {
    for (let i = 0; i < numCPUs; i++) {
        if(i == 0){
            new Server().run();
        }
        if(i == 1){
            new Croner().run();
        }
    }
}

function childProcess() {
    process.exit();
}