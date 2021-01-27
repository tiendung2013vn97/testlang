<template>
    <div class="social">
        <div class="text-center">
            <span class="font-12 text-gray">Hoặc đăng nhập bằng</span>
        </div>
        <div class="d-md-flex mt-3">
            <button type="button" class="btn-fb mr-md-2" @click="fbLogin">
                <span class="font-14 font-md-16">Login with</span>
                <i class="fab fa-facebook-square font-md-18 mx-2"></i>
            </button>
        
            <GoogleLogin class="btn-gg mt-2 mt-md-0" :params="googleSignInParams" :onSuccess="onGoogleSignInSuccess" :onFailure="onGoogleSignInError" >
            Login with
            <i class="fab fa-google-plus-square font-md-18 mx-2"></i>
            </GoogleLogin>
        </div>
    </div>
</template>
<script>
import AuthService from '~/services/auth.service';
import SocketService from '~/services/socket.service';
import GoogleLogin from 'vue-google-login';
export default {
    components:{
        GoogleLogin
    },
    data(){
        return{
            isAuth: AuthService.isAuth,
            FB: undefined,
            facebook_client_id : '',
            google_client_id: '',
            fbSignInParams: {
                scope: '',
                return_scopes: true
            },
            googleSignInParams: {
                client_id: ''
            },
             renderParams: {
                    // width: 250,
                    // height: 50,
                    // longtitle: true
                }
        }
    },
    created() {
        this.getClientId('facebook_client_id');
        this.getClientId('google_client_id');
        
        // this.checkFbLogin()
        
    },
    methods:{
        fbLogin(){
            let thiz=this
            FB.login(function(response) {
            // handle the response
            if(response.status!=="connected") return
                    FB.api('/me', 'GET', { fields: 'id , name , picture.type(large)' }, function(data) {
                    const {id:facebook_id,name}=data
                        let loginData={
                            facebook_id,
                            accessToken:response.authResponse.accessToken,
                            type:"facebook"
                        }
                        thiz.$http.post("auth/login",loginData).then(val=>{
                                const { loginRedirect } = thiz.$store.state;
                                AuthService.setAccessToken(val.data.token);
                                // localStorage.setItem("isLogin",true)
                                // localStorage.setItem("loginType","facebook")
                                thiz.$http.get("user/settings")
                                .then(val=>{
                                    localStorage.setItem("userSetting",JSON.stringify(val.data.value))
                                })
                                if(loginRedirect){
                                    thiz.$router.push(loginRedirect);
                                    thiz.$store.commit('setLoginRedirect', '');
                                }else{
                                    thiz.$router.push({ name: 'index' });
                                }
                        }).catch(error=>{
                            thiz.$toastr('error', "Có lỗi trong quá trình xử lí. Vui lòng thử lại sau");
                            console.log("error when login with facebook",error)
                        })
            });
            }, {scope: 'public_profile,email'});
        },
        onGoogleSignInSuccess(googleUser){
            let loginData={
                accessToken:googleUser.xc.access_token,
                type:"google"
            }
            this.$http.post("auth/login",loginData).then(val=>{
                                const { loginRedirect } = this.$store.state;
                                AuthService.setAccessToken(val.data.token);
                                // localStorage.setItem("isLogin",true)
                                // localStorage.setItem("loginType","facebook")
                                this.$http.get("user/settings")
                                .then(val=>{
                                    localStorage.setItem("userSetting",JSON.stringify(val.data.value))
                                })                                
                                if(loginRedirect){
                                    this.$router.push(loginRedirect);
                                    this.$store.commit('setLoginRedirect', '');
                                }else{
                                    this.$router.push({ name: 'index' });
                                }
                        }).catch(error=>{
                            this.$toastr('error', "Có lỗi trong quá trình xử lí. Vui lòng thử lại sau");
                            console.log("error when login with facebook",error)
                        })
        },
        onGoogleSignInError(error){
            if(error&&error.error=="popup_closed_by_user")return
            this.$toastr('error', "Có lỗi trong quá trình xử lí. Vui lòng thử lại sau");
            console.log('Error when login with google', error)
        },

        checkFbLogin(){
            FB.getLoginStatus(function(response) {
                // console.log("getLoginStatus",response)
                // if(response.)
                // statusChangeCallback(response);
            });
        },

        // Function load SDK Facebook
        loadFbSdk(appId, version) {
            let thiz=this
            return new Promise(resolve => {
                window.fbAsyncInit = function () {
                    // eslint-disable-line func-names
                    FB.init({
                    appId,
                    xfbml: true, // parse XFBML
                    status : true, // check login status
                    version,
                    cookie: true // enable cookies to allow the server to access the session
                    });
                    // FB.AppEvents.logPageView();

                    thiz.checkFbLogin()
                    resolve('SDK Loaded!');

                };
                        (function (d, s, id) {
                        // eslint-disable-line func-names
                        const fjs = d.getElementsByTagName(s)[0];
                        if (d.getElementById(id)) { return; }
                        const js = d.createElement(s); js.id = id;
                        js.src = '//connect.facebook.net/en_US/sdk.js';
                        fjs.parentNode.insertBefore(js, fjs);
                    
                    }(document, 'script', 'facebook-jssdk'));
            });
        },

        // Login with Facebook
        onSignInSuccess (response) {
            FB.api('/me', 'GET', { fields: 'id , name , email ' },
            userInformation => {
                let data = {};
                data.id = userInformation.id;
                data.name = userInformation.name;
                data.email = userInformation.email;
                data.picture = userInformation.picture.data.url;
                this.$http.post('auth/facebook' , data)
                .then(response => {
                    const { loginRedirect } = this.$store.state;
                    AuthService.setAccessToken(response.data.token);
                    if(loginRedirect){
                        this.$router.push(loginRedirect);
                        this.$store.commit('setLoginRedirect', '');
                    }else{
                        this.$router.push({ name: 'index' });
                    }
                })
                .catch(response => {
                    if(response.data.error){
                        this.$toastr('error', response.data.error);
                    }
                });
            })
        },
        onSignInError (error) {
            console.log('OH NOES', error)
        },

        // Function get CLIENT_ID facebook & google from setting
        getClientId(key) {
            this.$http.get("/auth/client-id?id=" + key)
            .then( res => {
                const data = res.data.data;
                if(key == "google_client_id")
                {   this.google_client_id = data;
                    this.googleSignInParams.client_id=data
                } 
                else{
                    this.facebook_client_id = data;
                    this.loadFbSdk(data , 'v2.10');
                }
                // console.log("facebook_client_id",this.facebook_client_id,"\ngoogle_client_id",this.google_client_id)
            })
            .catch( res => {
                console.log(res);
            });
        },

        // Login with google
        OnGoogleAuthSuccess (idToken) {
            let data = {};
            // Receive the idToken and make your magic with the backend
            this.$http.get('/auth/get-info-google?token='+idToken)
            .then( res => {
                data.id = res.data.payload.sub;
                data.name = res.data.payload.family_name +' '+ res.data.payload.given_name;
                data.picture = res.data.payload.picture;
                data.email = res.data.payload.email;
                this.$http.post('/auth/google' , data)
                .then( response => {
                    const { loginRedirect } = this.$store.state;
                    AuthService.setAccessToken(response.data.token);
                    if(loginRedirect){
                        this.$router.push(loginRedirect);
                        this.$store.commit('setLoginRedirect', '');
                    }else{
                        this.$router.push({ name: 'index' });
                    }
                })
                .catch( response => {
                    if(response.data.error){
                        this.$toastr('error', response.data.error);
                    }
                })
            })
            .catch( res => {
                console.log(res);
            })

        },
        OnGoogleAuthFail (error) {},
    },
}
</script>