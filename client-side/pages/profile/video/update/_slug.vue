<template>
    <div class="col-12 mr-lg-4 gl-container transition-normal">
        <template v-if="isLoad">
            <div class="text-center mt-3">
                <PulseLoader :color="'#da8cff'" :size="'20px'"/>
            </div>
        </template>
        <template v-else>
            <div v-if="video">
                <UploadForm :video="video"/>
            </div>
        </template>
    </div>
</template>
<script>
import UploadForm from '~/components/client/video/UploadForm.vue';
import SocketService from '~/services/socket.service';
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
        initVideo: function() {
            this.isLoad = true;
            this.$http.get('videos/video-update/' + this.$route.params.slug)
            .then( response => {
                this.video = response.data.data;
                this.video.subtitles = this.video.subVideo;
                this.video.lang = this.video.raw_lang;
                this.video.langTranslate = this.video.translate_lang;
                for(let i in this.video.subtitles) {
                    this.video.subtitles[i].raw_mean = JSON.parse(this.video.subtitles[i].raw_mean);
                    this.video.subtitles[i].pronunciation = JSON.parse(this.video.subtitles[i].pronunciation);
                    // this.video.subtitles[i].full_mean_display=this.video.subtitles[i].raw_mean.trans.join(" ")
                    this.video.subtitles[i].default_mean_display=this.video.subtitles[i].default_mean.replace(/`/g,"")
                }
                this.video.imageStr = '';
                this.isLoad = false;  
            })
            .catch( response => {
                this.video = '';
                this.isLoad = false;
                if(response.status == 403){
                    this.$toastr('error', response.data.message);
                    this.$router.push({ name: 'login' });
                }else if(response.status == 404){
                    this.$toastr('error', response.data.message);
                    this.$router.push({ name: 'index' });
                }
            })
        }
    },
}
</script>