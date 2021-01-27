<template>
    <div class="col-12 gl-container transition-normal">
        <template v-if="isLoad">
            <div class="text-center mt-3">
                <PulseLoader :color="'#da8cff'" :size="'20px'"/>
            </div>
        </template>
        <template v-else>
            <UploadForm :video="video"/>
        </template>
    </div>
</template>

<script>
import UploadForm from '~/components/client/video/UploadForm.vue';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

export default {
    components:{
        UploadForm,
        PulseLoader
    },
    data() {
        return {
            video: '',
            isLoad: true,
        }
    },
    created() {
        this.initVideo();
    },
    methods: {
        initVideo: function(){
            setTimeout(function() {
                this.isLoad = false;
            }.bind(this), 100);
            this.video = {
                imageStr: '',
                linkImage: '',
                title: '',
                link: '',
                description: '',
                slug: '',
                categories: [],
                channel: '',
                subtitles: [],
                duration: '',
                price: '',
            };
        }
    },
    
}
</script>