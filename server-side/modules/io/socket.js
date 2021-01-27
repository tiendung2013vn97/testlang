const express = require('express');
const fs = require('fs');

class SocketIO {
    /**
     * @description This method runs socket-io.
     * @return {void}
     */
    static async run() {
        // Init
        const { SOCKET_PORT, HTTPS_MODE, KEY_PATH, CERT_PATH } = process.env;
        let server = '';
        if (HTTPS_MODE && HTTPS_MODE == 'true') {
            server = require('https').createServer({
                key: fs.readFileSync(KEY_PATH),
                cert: fs.readFileSync(CERT_PATH)
            }, express);
        } else {
            server = require('http').createServer(express);
        }
        const io = require('socket.io')(server);

        // Process
        io.on('connection', socket => {
            socket.on('process', (data) => {
                if (data) {
                    io.sockets.emit('update', data);
                }
            });
            socket.on('processSubcribe', (data) => {
                if (data) {
                    io.sockets.emit('updateSubcribe', data);
                }
            });
            socket.on('processWatchLater', (data) => {
                if (data) {
                    io.sockets.emit('updateWatchLater', data);
                }
            });
            socket.on('processUserLogin', (data) => {
                if(data){
                    io.sockets.emit('updateUserLogin', data);
                }
            });
        })

        // Listen port
        console.log(`Socket.IO is listening on port ${SOCKET_PORT}!`);
        server.listen(SOCKET_PORT);
    }
}
module.exports = SocketIO;