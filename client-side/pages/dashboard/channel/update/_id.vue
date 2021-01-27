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
            <div class="col-12 grid-margin stretch-card" v-if="channel">
                <ChannelForm :channel="channel"/>
            </div>
        </template>
    </div>
</template>
<script>
import ChannelForm from '~/components/dashboard/form/Channel.vue';
import SocketService from '~/services/socket.service';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

export default {
    components:{
        ChannelForm,
        PulseLoader
    },
    data() {
        return {
            channel: '',
            isLoad: true,
        }
    },
    created() {
        this.$store.commit('setActiveSidebar', { isActive: 'channel' });
        this.initChannel();
    },
    methods: {
        initChannel: function() {
            this.isLoad = true;
            this.$http.get('channel/update/' + this.$route.params.id)
            .then( response => {
                this.channel = response.data.data;
                this.channel.bannerStr = '';
                this.isLoad = false;
            })
            .catch( response => {
                this.channel = '';
                this.isLoad = false;
                if(response.status == 400){
                    this.$toastr("error","Có lỗi trong quá trình xử lí dữ liệu");
                }else{
                    this.$toastr('error', response.data.message);
                    this.$router.push({ name: 'dashboard-channel', query: { page: this.$route.query.return } });
                }
            })
        }
    },
    mounted(){
    }
}
</script>