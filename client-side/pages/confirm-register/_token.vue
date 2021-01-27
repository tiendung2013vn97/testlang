<template>
    <div class="gl-container gl-wrap--padding-left transition-normal ">
    </div>
</template>
<script>
import AuthService from '~/services/auth.service';
export default {
    components: {
        AuthService,
    },
    data() {
        return {
            token: '',
        }
    },
    created() {
        if(this.$route.params.token === undefined || this.$route.params.token === null || AuthService.isAuth){
            this.$router.push({ name: 'index' });
        }else{
            this.confirmRegister();
        }
    },
    methods: {
        confirmRegister: function() {
            let data = {};
            data.mail_token = this.$route.params.token;
            this.$http.post("auth/confirm-register/",data)
            .then((response) => {
                AuthService.setAccessToken(response.data.token);
                this.$store.commit('user/set', AuthService.setUser());
                this.$toastr("success",response.data.message);
                this.$router.push({ name: 'index' });
            })
            .catch((response) => {
                if(response.status == 400){
                    this.$toastr("error","Có lỗi trong quá trình xử lí dữ liệu");
                }else if(response.status == 404){
                    this.$router.push({ name: 'index' });
                    this.$toastr("error",response.data.message);
                }else if(response.status == 403){
                    this.$router.push({ name: 'login' });
                    this.$toastr("error",response.data.message);
                }
            });
        }
    }
}
</script>