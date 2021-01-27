<template>
    <div class="ml-lg-auto mr-lg-4 mx-xl-auto gl-container transition-normal mt-5">
        <template v-if="!transaction_code">
            <PulseLoader :color="'#f44336'" :size="'20px'"/>
        </template>
        <template v-else>
            <div class="text-center">Đơn hàng <span class="text-main">{{ transaction_code }}</span> đã được xử lý</div>
            <div class="text-center">{{ message }}</div>
        </template>
    </div>
</template>
<script type="text/javascript">
import AuthService from '~/services/auth.service';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

export default {
    components: {
        PulseLoader,
    },
    data() {
        return {
            message: '',
            transaction_code: '',
        }
    },
    created() {
        this.checkout();
    },
    methods: {
        checkout: function() {
            let data = {};
            if(this.$route.query.type == 'PayPal' || this.$route.query.type == 'NganLuong') {
                data = {
                    paymentId: this.$route.query.paymentId,
                    token: this.$route.query.token,
                    PayerID: this.$route.query.PayerID 
                }
            }
            this.$http.post(`transactions/checkout/${this.$route.params.code}?status=${this.$route.query.status ? this.$route.query.status: ''}`, data)
            .then(response => {
                let data = response.data;
                this.message = data.message;
                this.transaction_code = data.transaction_code;
                // Update user data in vuex
                if(data.message && data.token) {
                    AuthService.setAccessToken(data.token);
                    this.$store.commit('user/set', AuthService.setUser());
                }
            })
            .catch(response => {
                this.$toastr("error", response.data.message);
                if(response.status == 404){
                    this.$router.push({ name: 'profile-recharge' });
                }else if(response.status == 403){
                    this.$router.push({ name: 'login' });
                }
            })
        },
    },
}
</script>