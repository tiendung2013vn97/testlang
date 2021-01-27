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
            <div class="col-12 grid-margin stretch-card">
                <ChannelForm :channel="channel"/>
            </div>
        </template>
    </div>
</template>

<script>
import ChannelForm from '~/components/dashboard/form/Channel.vue';
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
        this.$store.commit('setActiveSidebar', { isActive: 'channel', subIsActive: 'channel-create' });
        this.initChannel();
    },
    methods: {
        initChannel: function(){
            setTimeout(function() {
                this.isLoad = false;
            }.bind(this), 1000);
            this.channel = {
                title: '',
                bannerStr: '',
                description: '',
            };
        }
    },
    
}
</script>