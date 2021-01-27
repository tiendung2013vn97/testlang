/**
 * @class AuthService
 * @static
 * @hideconstructor
 */
class AuthService{
    /**
    * @static
    * @description Gets access token from the localStorage
    * @return {string}
    */
    static get accessToken(){
        let token = !process.server ? localStorage.getItem('langAdvisorAccessToken') : '';
        if(token){
            return `Bearer ${token}`
        }
        return token;
    }

    /**
    * @static
    * @description Sets access token at the localStorage
    * @param {string} token
    * @return {void}
    */
    static setAccessToken(accessToken){
        if(!process.server) { 
            localStorage.setItem('langAdvisorAccessToken', accessToken);
        }
    }

    /**
    * @static
    * @return {boolean}
    */
    static get isAuth(){
        return Boolean(this.accessToken);
    }

    /**
    * @static
    * @description Clear all token of the localStorage.
    * @returns {void}
    */
    static logOut(){
        if(!process.server) { 
            localStorage.removeItem('langAdvisorAccessToken');
            localStorage.removeItem('userSetting')
        }
    }

    /**
    * @static
    * @description Set user login
    * @returns {void}
    */
    static setUser(){
        let token = !process.server ? localStorage.getItem('langAdvisorAccessToken') : '';
        if(token){
            return JSON.parse(this.decodeJWT(token));
        }
        return {};
    }

    /**
    * Decode base64String and fix utf8 problem
    */
    static decodeJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace('-', '+').replace('_', '/');
            return decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        }catch(error) {
            this.logOut();
            return '{}';
        }
    }
}

export default AuthService;
