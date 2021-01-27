const API_PORT = !process.server ? process.env.API_PORT : '3001';
export default {
    apiUrl :`${!process.server? window.location.protocol : 'http:'}//${!process.server? window.location.hostname : 'localhost'}:${API_PORT}/api/`
}