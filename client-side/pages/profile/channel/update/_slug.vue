<template>
    <div class="ml-lg-auto mr-lg-4 mx-xl-auto gl-container transition-normal">
        <template v-if="isLoad">
            <div class="text-center mt-3">
                <PulseLoader :color="'#da8cff'" :size="'20px'"/>
            </div>
        </template>
        <template v-else>
            <div v-if="channel">
                <ChannelForm :channel="channel"/>
            </div>
        </template>
    </div>
</template>
<script>
import ChannelForm from '~/components/client/channel/ChannelForm.vue';
import SocketService from '~/services/socket.service';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

export default {
    components:{
        ChannelForm,
        PulseLoader,
    },
    data() {
        return {
            channel: '',
            isLoad: true,
        }
    },
    created() {
        this.initChannel();
    },
    methods: {
        initChannel: function() {
            this.isLoad = true;
            this.$http.get('channel/detail-channel-user/' + this.$route.params.slug)
            .then( response => {
                this.channel = response.data.data;
                this.channel.avatarStr = '';
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
                    this.$router.push({ name: 'index' });
                }
            })
        }
    },
}
</script>