<template>
    <div class="gl-trending gl-padding-bottom">
        <div class="container">
            <div class="mx-0 row">
                <div class="col-12 col-lg-9 order-2 order-lg-1">
                    <hr>
                    <template v-if="isLoad">
                        <div class="list">
                            <template v-if="listVideosTrend.length">
                                <template v-for="(video, index) in listVideosTrend">
                                    <div class="mt-3 row item-video" :key="index">
                                        <div class="col-12 col-md-4 col-sm-5">
                                            <div class="img-video">
                                                <nuxt-link class="link-video w-100" :to="{ name: 'video-slug', params: { slug: video.slug } }">
                                                    <div class="img">
                                                        <img :src="globalImageUrl(video.image ? video.image : 'images-asset/img-video.png')" class="border-radius-10 h-100 w-100"/>
                                                    </div>
                                                    <div class="border-radius-10 bg-obacity-player h-100 w-100">
                                                        <div class="player"><i class="fas fa-play"></i></div>
                                                    </div>
                                                </nuxt-link>
                                                <div class="bg-opacity font-11 time-video">
                                                    {{ globalCalculateVideoTime(video.duration) }}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col">
                                            <div class="info">
                                                <div class="d-flex">
                                                    <nuxt-link class="flex-3 font-14 font-weight-bold mb-2 pr-4 text-dark text-decoration-none text-overflow-hidden-y" :to="{ name: 'video-slug', params: { slug: video.slug } }">
                                                        {{ video.title }}
                                                    </nuxt-link>
                                                </div>
                                                <div class="align-items-md-center d-flex flex-column flex-md-row">
                                                    <nuxt-link :to="{ name: 'channel-slug', params: { slug: video.user.channel.slug } }" class="channel-name text-dark text-decoration-none">
                                                        <div class="align-items-center d-flex">
                                                            <div class="d-flex img-avatar mr-1">
                                                                <img :src="globalImageUrl(video.user.channel.avatar ? video.user.channel.avatar : 'images-asset/No_Image_Available.jpg')" class="h-100 w-100 rounded-circle"/>
                                                            </div>
                                                            <div class="font-12 name">{{ video.user.channel ? video.user.channel.title : '' }}</div>
                                                        </div>
                                                    </nuxt-link>
                                                    <div class="font-11 ml-md-3 mt-2 mt-md-0 text-primary">{{ globalFormatNumber("" + video.view,".") }} lượt xem</div>
                                                </div>
                                                <p class="font-8 font-md-14 font-md-16 mt-2 content text-overflow-hidden-y mb-0" v-html="video.description">
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </template>
                            <template v-else>
                                <div class="text-center">
                                    Không tìm thấy kết quả nào
                                </div>
                            </template>
                        </div>
                    </template>
                    <template v-else>
                        <PulseLoader :color="'#da8cff'" :size="'20px'" class="text-center"/>
                    </template>
                </div>     
            </div>
        </div>
    </div>
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
            listVideosTrend: '',
            isLoad: false,
            langStudy: this.$store.state.langStudy,
        };
    },
    created() {
        this.initVideo();
    },
    methods: {
        initVideo: function () {
            this.isLoad = false;
            this.$http.get('videos/trending?trendingLimit=20&lang=' + this.langStudy.raw_lang.code + '&langTrans=' + this.langStudy.lang_trans.code)
            .then(response => {
                this.isLoad = true;
                this.listVideosTrend = response.data.videoTrend;
            })
        },
    },
}
</script>
