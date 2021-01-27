import io from 'socket.io-client';

const SOCKET_PORT = !process.server ? process.env.SOCKET_PORT : '5001';
const socket = io.connect(`${!process.server ? window.location.protocol : 'http:'}//${!process.server ? window.location.hostname : 'localhost'}:${SOCKET_PORT}`);

class SocketService {

    /**
    * @description Emit event to Socket
    * @return emit event
    */
    static emit(key, data){
        socket.emit(key, data);
    }

    /**
    * @description Socket object
    * @return {void}
    */
    static get socket(){
        return socket;
    }
}

export default SocketService;
