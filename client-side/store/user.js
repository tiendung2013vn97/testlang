import HttpConfig from '~/plugins/http/http.config'
import AuthService from '~/services/auth.service';

const http = HttpConfig.get();
export const state = () => ({
    data: {},
})

export const mutations = {
    set (state, user) {
        state.data = user;
    },
}

export const actions = {
    async authentication({ commit }, context){
        if(!process.server) {
            if(AuthService.isAuth) {
                await http.post('auth/check', {})
                .then(response => {
                    const current_token = AuthService.accessToken;
                    if(current_token && current_token != response.data.token) {
                        AuthService.setAccessToken(response.data.token);
                    }
                })
                .catch(response => {
                    if(response.status == 403){
                        AuthService.logOut();
                    }
                })
            }
            const { url, route } = context;
            let { fullPath } = route;

            const current_template = fullPath.split('/')[1] ? fullPath.split('/')[1] : '';
            const pages_check = [
                'dashboard',
                'profile',
            ];
            if(url){
                this.$router.push(url);
            }
            const user = AuthService.setUser();
            commit('set', user);
            if(AuthService.isAuth){             
                if(current_template == 'dashboard' && user.account_type != 'ADMIN'){
                    this.$router.push({ name: 'index' });
                }           
            }else {
                if(pages_check.indexOf(current_template) !== -1 && !AuthService.isAuth){
                    if(current_template == 'dashboard'){
                        this.$router.push({ name: 'login-dashboard' });
                    }else{
                        this.$router.push({ name: 'login' });
                    }
                }
            }
        }
    }
}