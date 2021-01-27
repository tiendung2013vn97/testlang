<template>
    <div v-if="!isAuth">
        <body v-if="isLoaded">
            <div class="container-scroller">
                <div class="container-fluid page-body-wrapper full-page-wrapper">
                    <div class="content-wrapper d-flex align-items-center auth">
                        <div class="row w-100">
                            <div class="col-lg-4 mx-auto">
                                <div class="auth-form-light text-left p-5">
                                    <h6 class="font-weight-light">Vui lòng đăng nhập để tiếp tục</h6>
                                    <form class="pt-3" v-on:submit.prevent="login">
                                        <div class="form-group">
                                            <input type="email" class="form-control form-control-lg" placeholder="Email" v-model="email">
                                            <template v-if="globalObjectLength(errors)">
                                                <template v-for="error in errors['email']">
                                                    <div class="text-danger mt-2">{{ error }}</div>
                                                </template>
                                            </template>
                                        </div>
                                        <div class="form-group">
                                            <input type="password" class="form-control form-control-lg" placeholder="Mật Khẩu" v-model="password">
                                            <template v-if="globalObjectLength(errors)">
                                                <template v-for="error in errors['password']">
                                                    <div class="text-danger mt-2">{{ error }}</div>
                                                </template>
                                            </template>
                                        </div>
                                        <div class="mt-3">
                                            <button type="submit" class="btn btn-block btn-gradient-primary btn-lg font-weight-medium auth-form-btn" @click="login" :disabled="disabledSubmit">
                                                <span v-if="disabledSubmit">
                                                    <PulseLoader :color="'white'" :size="'10px'"/>
                                                </span>
                                                <span v-else>
                                                    Đăng nhập
                                                </span>
                                            </button> 
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- content-wrapper ends -->
                </div>
                <!-- page-body-wrapper ends -->
            </div>
        </body>
        <body v-else>
            <div class="text-center mt-3">
                <PulseLoader :color="'#da8cff'" :size="'20px'"/>
            </div>
        </body>
    </div>
</template>
<script type="text/javascript">
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import AuthService from '~/services/auth.service';

export default {
    components: {
        PulseLoader
    },
    data() {
        return {
            isAuth: AuthService.isAuth,
            isLoaded: false,
            email: '',
            password: '',
            errors: {},
            disabledSubmit : false,
        }
    },
    created() {
        if(AuthService.isAuth){
            this.$router.push({ name: 'index' });
        }
        setTimeout( function(){
            this.isLoaded = true;
        }.bind(this), 500);
    },
    methods: {
        login: function(){
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

                    AuthService.setAccessToken(response.data.token);
                    let user = AuthService.setUser();
                    if(user.account_type == 'ADMIN'){
                        this.$router.push({name: 'dashboard'});
                    }else{
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
    }
}
</script>