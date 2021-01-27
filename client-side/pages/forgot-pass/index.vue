<template>
    <section class="gl-auth d-flex p-sm-3">
        <div class="my-auto w-100">
            <div class="gl-auth__form mx-auto p-5 bg-white rounded">
                <h1 class="font-20 font-md-24 font-weight-bold mb-4 text-center text-uppercase">quên mật khẩu</h1>
                <div class="mb-4">
                    <div class="form-input position-relative">
                        <input v-model="email" class="border-radius-10 py-3 w-100 font-14 border-0 pr-5" type="email" placeholder="Nhập Email"/>
                        <span class="symbol-input border-secondary position-absolute px-3 fas fa-envelope"></span>
                    </div>
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, index) in errors['email']">
                            <div class="text-danger mt-2" :key="index">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <button type="button" class="btn-login font-14" @click="sendPass" :disabled="disabledSubmit">
                    <span v-if="disabledSubmit">
                        <PulseLoader :color="'white'"/>
                    </span>
                    <span v-else>
                        Gửi
                    </span>
                </button>
                <div class="text-left mt-3">
                    <nuxt-link to="/login" class="font-14 my-auto">
                        <span class="fas fa-chevron-left pr-1"></span>Quay về trang đăng nhập
                    </nuxt-link>
                </div>
            </div>
        </div>
    </section>
</template>
<script>
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import AuthService from '~/services/auth.service';

export default {
    components: {
        PulseLoader,
    },
    data() {
        return {
            isAuth: AuthService.isAuth,
            email: '',
            url: window.location.origin,
            errors: {},
            disabledSubmit: false,
        }
    },
    methods: {
        sendPass(){
            this.disabledSubmit = true;
            this.errors = {};
            let data = {};
            data.email = this.email;
            data.url = this.url;
            this.$http.post("auth/forgot-pass",data)
            .then((response) => {
                this.disabledSubmit = false;
                this.$toastr("success",response.data.message);
            })
            .catch((response) => {
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
    created() {
        if(AuthService.isAuth){
            this.$router.push({ name: 'index' });
        }
    }
}
</script>