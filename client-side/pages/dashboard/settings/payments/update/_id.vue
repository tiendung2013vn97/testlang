<template>
    <div>
        <template v-if="isLoad">
            <div class="col-12 grid-margins tretch-card">
                <div class="text-center mt-3">
                    <PulseLoader :color="'#da8cff'" :size="'20px'"/>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="col-12 grid-margin stretch-card" v-if="payment">
                <PaymentForm :payment="payment"/>
            </div>
        </template>
    </div>
</template>
<script>
import PaymentForm from '~/components/dashboard/form/Payment.vue';
import SocketService from '~/services/socket.service';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

export default {
    components:{
        PaymentForm,
        PulseLoader
    },
    data() {
        return {
            payment: '',
            isLoad: true,
        }
    },
    created() {
        this.$store.commit('setActiveSidebar', { isActive: 'settings' , subIsActive: 'setting-payment'});
        this.initPayment();
    },
    methods: {
        initPayment: function() {
            this.$http.get('payments/edit/' + this.$route.params.id)
            .then( response => {
                this.payment = response.data.data;
                this.payment.total = response.data.total;
                this.isLoad = false;
            })
            .catch( response => {
                this.payment = '';
                this.isLoad = false;
                if(response.status == 400){
                    this.$toastr("error","Có lỗi trong quá trình xử lí dữ liệu");
                }else{
                    this.$toastr('error', response.data.message);
                    this.$router.push({ name: 'dashboard-settings-payments', query: { page: this.$route.query.return } });
                }
            })
        }
    },
    mounted(){
        const socket = SocketService.socket;
        socket.on('updatePayment', function(data){
            if(data && data == this.$route.params.id){
                this.initPayment();
            }
        }.bind(this));
    }
}
</script>