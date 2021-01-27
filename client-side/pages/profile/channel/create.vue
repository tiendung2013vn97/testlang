<template>
    <div class="ml-lg-auto mr-lg-4 mx-xl-auto gl-container transition-normal">
        <template v-if="isLoad">
            <div class="text-center mt-3">
                <PulseLoader :color="'#da8cff'" :size="'20px'"/>
            </div>
        </template>
        <template v-else>
            <ChannelForm :channel="channel"/>
        </template>
    </div>
</template>

<script type="text/javascript">
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import ChannelForm from '~/components/client/channel/ChannelForm.vue';

export default {
    components: {
        PulseLoader,
        ChannelForm,
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
        initChannel: function(){
            setTimeout(function() {
                this.isLoad = false;
            }.bind(this), 100);
            this.channel = {
                statusSub: 'show',
                title: '',
                avatarStr: '',
                bannerStr: '',
                description: '',
            };
        }
    },
}
</script>