<template>
    <section class="gl-auth d-flex p-sm-3" v-if="!isAuth">
        <div class="my-auto w-100">
            <div class="gl-auth__form mx-auto p-4 bg-white rounded">
                <h1 class="font-20 font-weight-bold mb-4 text-center text-uppercase">đăng nhập</h1>
                <div class="mb-4">
                    <div class="form-input position-relative">
                        <input class="py-3 w-100 border-0 border-radius-10 pr-5" type="text" placeholder="Email đăng nhập"  v-model="email" v-on:keyup.enter="login"  autocomplete="off"/>
                        <span class="fa-user fas position-absolute px-3 symbol-input"></span>
                    </div>
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, index) in errors['email']">
                            <div class="text-danger mt-2" :key="index">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <div class="mb-4">
                    <div class="form-input position-relative">
                        <input class="py-3 w-100 border-0 border-radius-10 pr-5" :type="passwordType" placeholder="Mật khẩu" v-model="password" autocomplete="off"/>
                        <span class="symbol-input position-absolute px-3 fas fa-lock"></span>
                        <span class="eye-input cursor-pointer position-absolute fas" :class="passwordType === 'password' ? 'fa-eye' : 'fa-eye-slash'" @click="showPwd()"></span>
                    </div>
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, index) in errors['password']">
                            <div class="text-danger mt-2" :key="index">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <button type="button" class="btn-login font-14" @click="login" :disabled="disabledSubmit">
                    <span v-if="disabledSubmit">
                        <PulseLoader :color="'white'" :size="'10px'"/>
                    </span>
                    <span v-else>
                        ĐĂNG NHẬP
                    </span>                    
                </button>
                <div class="my-3 text-center">
                    <nuxt-link to="/forgot-pass" class="font-12 text-gray text-underline">Bạn quên mật khẩu?</nuxt-link>
                </div>
                <div class="text-center">
                    <span class="text-gray d-inline font-14">Chưa có tài khoản?</span>
                    <nuxt-link to="/register" class="font-14">Đăng kí</nuxt-link>
                </div>
                <hr />
                <SocialLogin />
            </div>
        </div>
    </section>
</template>

<script>
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import AuthService from '~/services/auth.service';
import SocialLogin from '~/components/client/auth/SocialLogin.vue';

export default {
    components: {
        PulseLoader,
        SocialLogin,
    },
    data() {
        return {
            isAuth: AuthService.isAuth,
            disabledSubmit: false,
            email: '',
            password: '',
            errors: {},
            passwordType: 'password',
        }
    },
    methods: {
        showPwd() {
            if (this.passwordType === 'password') {
                this.passwordType = 'text'
            } else {
                this.passwordType = 'password'
            }
        },
        login: function() {
            if(!this.disabledSubmit) {
                this.disabledSubmit = true;
                let data = {};
                data.email = this.email;
                data.password = this.password;
                this.$http.post('/auth/login', data)
                .then(response => {
                    //get user setting
                    this.$http.get("user/settings")
                    .then(val=>{
                        localStorage.setItem("userSetting",JSON.stringify(val.data.value))
                    })

                    
                    const { loginRedirect } = this.$store.state;
                    AuthService.setAccessToken(response.data.token);
                    localStorage.setItem("isLogin",true)
                    //default mean login with langavisor account
                    localStorage.setItem("loginType","default")
                    if(loginRedirect) {
                        this.$router.push(loginRedirect);
                        this.$store.commit('setLoginRedirect', '');
                    }else {
                        this.$router.push({ name: 'index' });
                    }
                })
                .catch(response => {
                    this.disabledSubmit = false;
                    if(response.status == 400){
                        this.errors = response.data.errors;
                        this.$toastr('error', 'Có lỗi trong quá trình xử lí dữ liệu');
                    }else{
                        this.$toastr('error', response.data.message);
                    }
                })
            }
        },
    },
}
</script>