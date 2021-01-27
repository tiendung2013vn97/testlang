<template>
    <section class="gl-auth d-flex p-sm-3">
        <div class="my-auto w-100">
            <div class="bg-white gl-auth__form mx-auto p-4 rounded">
                <h1 class="font-20 font-md-24 font-weight-bold text-center text-uppercase">đăng ký</h1>
                <div class="mb-4">
                    <div class="form-input position-relative">
                        <input class="py-3 w-100 font-14 border-0 border-radius-10 pr-5" v-model="username" placeholder="Tên tài khoản" autocomplete="off"/>
                        <span class="symbol-input border-secondary position-absolute px-3 fas fa-user font-14 font-md-16"></span>
                    </div>
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, index) in errors['username']">
                            <div class="text-danger mt-2" :key="index">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <div class="mb-4">
                    <div class="form-input position-relative">
                        <input class="py-3 w-100 font-14 border-0 border-radius-10 pr-5" type="email" v-model="email" placeholder="Email đăng nhập" autocomplete="off"/>
                        <span class="symbol-input border-secondary position-absolute px-3 fas fa-envelope font-14 font-md-16"></span>
                    </div>
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, index) in errors['email']">
                            <div class="text-danger mt-2" :key="index">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <div class="mb-4">
                    <div class="form-input position-relative">
                        <input class="py-3 w-100 font-14 border-0 border-radius-10 pr-5" :type="passwordType" v-model="password" placeholder="Mật khẩu" autocomplete="off"/>
                        <span class="symbol-input border-secondary position-absolute px-3 fas fa-lock font-14 font-md-16"></span>
                        <span class="eye-input cursor-pointer position-absolute fas font-14 font-md-16" :class="passwordType === 'password' ? 'fa-eye' : 'fa-eye-slash'" @click="showPwd"></span>
                    </div>
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, index) in errors['password']">
                            <div class="text-danger mt-2" :key="index">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <div class="mb-4">
                    <div class="form-input position-relative">
                        <input class="py-3 w-100 font-14 border-0 border-radius-10 pr-5" :type="password_cType" v-model="password_c" placeholder="Xác nhận mật khẩu" autocomplete="off"/>
                        <span class="symbol-input border-secondary position-absolute px-3 fas fa-lock font-14 font-md-16"></span>
                        <span class="eye-input cursor-pointer position-absolute fas font-14 font-md-16" :class="password_cType === 'password' ? 'fa-eye' : 'fa-eye-slash'" @click="showPwd_c"></span>
                    </div>
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, index) in errors['password_c']">
                            <div class="text-danger mt-2" :key="index">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <button type="button" class="btn-register font-14" @click="register" :disabled="disabledSubmit">
                    <span v-if="disabledSubmit">
                        <PulseLoader :color="'white'"/>
                    </span>
                    <span v-else>
                        Đăng ký
                    </span>
                </button>
                <div class="text-center my-3">
                    <p class="text-dark d-inline font-14 pr-2 w-100">Đã có tài khoản ?</p>
                    <nuxt-link to="/login" class="font-14">Đăng nhập</nuxt-link>
                </div>
                <hr/>
                <SocialLogin/>
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
        SocialLogin
    },
    data() {
        return {
            isAuth: AuthService.isAuth,
            disabledSubmit: false,
            username: '',
            email: '',
            password: '',
            password_c: '',
            url: window.location.origin,
            passwordType: 'password',
            password_cType: 'password',
            errors: {},
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
        showPwd_c() {
            if (this.password_cType === 'password') {
                this.password_cType = 'text'
            } else {
                this.password_cType = 'password'
            }
        },
        register() {
            if(!this.disabledSubmit){
                this.disabledSubmit = true;
                let data = {};
                data.username = this.username;
                data.email = this.email;
                data.password = this.password;
                data.password_c = this.password_c;
                data.url = this.url;
                this.$http.post("auth/register",data)
                .then(response => {
                    this.$toastr("success",response.data.message);
                    this.$router.push({ name: 'login' });
                })
                .catch(response => {
                    this.disabledSubmit = false;
                    if(response.status == 400){
                        this.errors = response.data.errors;
                        this.$toastr("error","Có lỗi trong quá trình xử lí dữ liệu");
                    }else{
                        this.$toastr("error",response.data.message);
                    }
                });
            }
        },
    },
}
</script>