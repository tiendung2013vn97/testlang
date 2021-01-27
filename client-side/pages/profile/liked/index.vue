<template>
    <section class="gl-liked container gl-padding-bottom">
        <h2 class="font-16 font-md-18 font-weight-bold font-openSans py-2">Videos đã thích</h2>
        <div class="row">
            <div class="gl-liked__content col-12">
                <template v-if="isLoad">
                    <template v-if="listLikedVideo && listLikedVideo.length > 0">
                        <template v-for="(video, index) in listLikedVideo">
                            <div class="item-content d-flex pt-3" :key="index">
                                <div class="col-4 px-0">
                                    <div class="img-video overflow-hidden position-relative">
                                        <nuxt-link class="link-video" :to="{ name: 'video-slug', params: {slug: video.slug} }">
                                            <img :src="globalImageUrl(video.image ? video.image : 'images-asset/No_Image_Available.jpg')" class="border-radius-10 w-100"/>
                                            <div class="bg-player border-radius-10 h-100 w-100">
                                                <div class="icon-player"><i class="fas fa-play"></i></div>
                                            </div>
                                        </nuxt-link>
                                        <div class="font-11 time-video position-absolute font-14 py-1 px-2">
                                            {{ globalCalculateVideoTime(video.duration) }}
                                        </div>
                                    </div>
                                </div>
                                <div class="col-8 pr-0">
                                    <div class="detail">
                                        <nuxt-link :to="{ name: 'video-slug', params: {slug: video.slug} }">
                                            <h4 class="overflow-hidden font-16 font-md-20 font-weight-bold font-openSans mb-0 text-dark">{{ video.title }}</h4>
                                        </nuxt-link>
                                        <div class="picture d-flex align-items-center mt-1 mt-md-2">
                                            <nuxt-link :to="{ name: 'video-slug', params: {slug: video.slug} }">
                                                <img :src="globalImageUrl(video.image ? video.image : 'images-asset/No_Image_Available.jpg')" class="rounded-circle">
                                            </nuxt-link>
                                            <nuxt-link :to="{ name: 'channel-slug', params: {slug: video.user.channel.slug} }" class="mb-0 font-14 font-md-18 font-openSans ml-2 text-dark">
                                                {{ video.user.channel.title }}
                                            </nuxt-link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </template>
                    <template v-else>
                        <div class="text-center">
                            Không có video nào
                        </div>
                    </template>
                </template>
                <template v-else>
                    <PulseLoader :color="'#da8cff'" :size="'20px'" class="text-center"/>
                </template>
            </div>
        </div>
    </section>
</template>

<script>
import Pagination from '~/components/common/pagination/VuePagination.vue';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

export default {
    components: {
        Pagination,
        PulseLoader,
    },
    data() {
        return {
            listLikedVideo: '',
            userStore: this.$store.state.user.data,
            searchData: this.$route.query.key_words && this.$route.name === 'profile-liked' ? this.$route.query.key_words : '',
            isLoad: false,
            langStudy: this.$store.state.langStudy,
        }
    },
    created() {
        this.initLikedVideo();
    },
    methods: {
        initLikedVideo() {
            this.isLoad = false;
            if(this.searchData){
                this.searchVideo();
            }else{
                this.$http.get('videos/liked?lang=' + this.langStudy.raw_lang.code + '&langTrans=' + this.langStudy.lang_trans.code)
                .then( response => {
                    this.listLikedVideo = response.data.listLikedVideo;
                    this.isLoad = true;
                })
            }
            
        },
        searchVideo() {
            if(this.searchData){
                this.$router.push({ 
                    name: 'profile-liked', 
                    query: { key_words: this.searchData },
                    force: true,
                    
                })
                this.$http.get('videos/search/liked?key_words=' + this.searchData + '&lang=' + this.langStudy.raw_lang.code + '&langTrans=' + this.langStudy.lang_trans.code)
                .then( response => {
                    this.listLikedVideo = response.data.videoSearch;
                    this.isLoad = true;
                })
                .catch( response => {
                    this.listLikedVideo = '';
                    this.isLoad = true;
                })
            }else{
                this.$toastr('error', 'Vui lòng nhập tiêu đề video');
            }
        }
    },
}
</script>