import axios from 'axios';
import AuthService from '~/services/auth.service';

const API_PORT = !process.server ? process.env.API_PORT : '3001';
const apiUrl = `${!process.server? window.location.protocol : 'http:'}//${!process.server? window.location.hostname : 'localhost'}:${API_PORT}/api/`;

/**
 * Create Axios
 */
export const http = axios.create({
    baseURL: apiUrl,
})

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our NodeJS back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */
http.interceptors.request.use(
    config => {
        config.headers.common['Authorization'] = AuthService.accessToken;
        return config;
    },
    error => {
        return Promise.reject(error);
    },
);

/**
 * Handle all error messages.
 */
if(!process.server) {
    http.interceptors.response.use(function (response) {
        const data = response.data.data;
        return response;
    }, function (error, res) {
        const { response } = error;
        if (response.status >= 301 && response.status <= 451) {
            if (response.status == 401) {
                $nuxt._router.push({ name: 'login' });
            }
            if(response.status == 413){
                alert('File size is too big');
            }
            return Promise.reject(response);
        }

        return Promise.reject(response);
    });
}

class HttpConfig{
    /**
    * Return http config
    */
    static get(){
        return http;
    }
}

export default HttpConfig;