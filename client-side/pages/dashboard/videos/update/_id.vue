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
            <div class="col-12 grid-margin stretch-card" v-if="video">
                <VideoForm :video="video"/>
            </div>
        </template>
    </div>
</template>
<script>
import VideoForm from '~/components/dashboard/form/Video.vue';
import SocketService from '~/services/socket.service';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

export default {
    components:{
        VideoForm,
        PulseLoader
    },
    data() {
        return {
            video: '',
            isLoad: true,
        }
    },
    created() {
        this.$store.commit('setActiveSidebar', { isActive: 'videos' });
        this.initVideo();
    },
    methods: {
        initVideo: function() {
            this.isLoad = true;
            this.$http.get('videos/update/' + this.$route.params.id)
            .then( response => {
                this.video = response.data.data;
                this.video.imageStr = '';
                this.video.subtitles = this.video.subVideo;
                this.video.lang = this.video.raw_lang;
                this.video.langTranslate = this.video.translate_lang;
                for(let i in this.video.subtitles) {
                    this.video.subtitles[i].raw_mean = JSON.parse(this.video.subtitles[i].raw_mean);
                    this.video.subtitles[i].pronunciation = JSON.parse(this.video.subtitles[i].pronunciation);
                }
                this.isLoad = false;
            })
            .catch( response => {
                this.video = '';
                this.isLoad = false;
                if(response.status == 400){
                    this.$toastr("error","Có lỗi trong quá trình xử lí dữ liệu");
                }else{
                    this.$toastr('error', response.data.message);
                    this.$router.push({ name: 'dashboard-videos', query: { page: this.$route.query.return } });
                }
            })
        }
    },
    mounted(){
    }
}
</script>