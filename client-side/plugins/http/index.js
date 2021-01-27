import HttpConfig from './http.config'

const http = HttpConfig.get();
export default function install(Vue) {
    Object.defineProperty(Vue.prototype, '$http', {
        get() {
            return http;
        },
    })
};

