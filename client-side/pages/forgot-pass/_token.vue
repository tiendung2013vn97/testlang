<template>
    <div class="p-2 pb-3" v-if="!isAuth">
        <div class="loginTop"></div>
        <div class="container forgotPassword col-xl-4 col-lg-5 col-md-6 col-12 border-s1 border-color-ba border-radius-5 p-5">
            <div class="text-center">
                <img :src="globalImageUrl('images-asset/code_qr.png')" alt="xxx">
                <div class="mt-4">
                    <h4>Quên mật khẩu</h4>
                    <div>Vui lòng nhập mật khẩu mới</div>
                </div>
                <div class="form-group mt-4">
                    <input type="password" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Mật khẩu mới" v-model="forgotDt.password" autocomplete="off">
                </div>
                <template v-if="globalObjectLength(errors)">
                    <template v-for="(error, index) in errors['password']">
                        <div class="text-danger d-flex" :key="index">{{ error }}</div>
                    </template>
                </template>
                <div class="form-group mt-4">
                    <input type="password" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Xác nhận mật khẩu mới" v-model="forgotDt.c_password" autocomplete="off">
                </div>
                <template v-if="globalObjectLength(errors)">
                    <template v-for="(error, index) in errors['c_password']">
                        <div class="text-danger d-flex" :key="index">{{ error }}</div>
                    </template>
                </template>
            </div>
            <div class="d-flex flex-row-reverse mt-5">
                <button type="button" class="btn btn-success px-4" @click="findPassword">
                    <span v-if="disabledSubmit">
                        <PulseLoader :color="'white'" :size="'10px'"/>
                    </span>
                    <span v-else>
                        Xác nhận
                    </span>
                </button>
            </div>
        </div>
    </div>
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
            forgotDt: {
                token: this.$route.params.token,
                password: '',
                c_password: '',
            },            
            errors: {},
            disabledSubmit: false,
        }
    },
    methods: {
        findPassword() {
            let data = this.forgotDt;
            this.disabledSubmit = true;
            this.errors = {};
            this.$http.post("auth/forgot-pass/",data)
            .then((response) => {
                this.$router.push({name: 'login'});
                this.$toastr("success", response.data.message);
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
        },
    },
    created() {
        if(AuthService.isAuth){
            this.$router.push({ name: 'index' });
        }
    }
}
</script>