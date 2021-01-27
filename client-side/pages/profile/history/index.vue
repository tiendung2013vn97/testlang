<template>
    <div class="gl-history gl-padding-bottom mt-4">
        <div class="container">
            <div class="col-12 col-lg-9">
                <div class="">
                    <div class="d-flex justify-content-center justify-content-sm-end mb-2">
                        <div class="cursor-pointer align-items-center d-flex delete-history flex-1 flex-sm-unset justify-content-sm-end justify-content-start mr-sm-5">
                            <i class="font-14 fas fa-trash"></i>
                            <span class="font-14 ml-2" @click="clearHistory">Xóa hết lịch sử</span>
                        </div>
                        <template v-if="user.history_status === 'active'">
                            <div class="cursor-pointer pause-history align-items-center d-flex justify-content-start justify-content-sm-end flex-1 flex-sm-unset"  @click="historyAction('inactive')">
                                <i class="font-14 fas fa-pause"></i>
                                <span class="font-14 ml-2">Tạm dừng lịch sử xem</span>
                            </div>
                        </template>
                        <template v-else>
                            <div class="cursor-pointer pause-history align-items-center d-flex justify-content-start justify-content-sm-end flex-1 flex-sm-unset" @click="historyAction('active')">
                                <i class="font-14 fas fa-play"></i>
                                <span class="font-14 ml-2">Tiếp tục lịch sử xem</span>
                            </div>
                        </template>
                    </div>
                    <div class="d-flex history pb-1">
                        <div class="view-history align-items-center d-flex flex-1">
                            <div class="">
                                <span class="font-md-18 font-weight-500">Lịch sử đã xem</span>
                            </div>
                        </div>
                        <div class="search-history d-none d-md-flex flex-1 justify-content-md-end cursor-pointer">
                            <i class="align-items-center d-flex fa-search fas text-black-50" @click="searchVideo"></i>
                            <input type="text" class="border-0 outline mr-1 text-right" placeholder="Tìm kiếm lịch sử xem" v-model="searchData" v-on:keyup.enter="searchVideo" autocomplete="off">
                        </div>
                        <div class="align-items-center d-flex d-md-none position-relative searchMobile cursor-pointer">
                            <i @click="globalShowDrop('showSearchMobile')" class="cursor-pointer showDrop font-14 fas fa-search"></i>
                            <div id="showSearchMobile" class="showDrop dropdown-menu d-none">
                                <input type="text" class="showDrop border-0 outline mr-1" placeholder="Tìm kiếm lịch sử xem" v-model="searchData" v-on:keyup.enter="searchVideo" autocomplete="off">
                            </div>
                        </div>
                    </div>
                    <div class="list">
                        <template v-if="isLoad">
                            <template v-if="history && history.length > 0">
                                <template v-for="(video, index) in history">
                                    <div class="mt-3 row item-video" :key="index">
                                        <div class="col-12 col-md-4 col-sm-5">
                                            <div class="img-video">
                                                <nuxt-link class="link-video w-100" :to="{ name: 'video-slug', params: { slug: video.slug } }">
                                                    <div class="img">
                                                        <img :src="globalImageUrl(video.image ? video.image : 'images-asset/No_Image_Available.jpg')" class="border-radius-10 h-100 w-100"/>
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
                                                    <nuxt-link class="font-13 font-md-18 font-weight-bold mb-2 pr-4 text-dark text-decoration-none text-overflow-hidden-y" :to="{ name: 'video-slug', params: { slug: video.slug } }">
                                                        {{ video.title }}
                                                    </nuxt-link>
                                                </div>
                                                <div class="align-items-md-center d-flex flex-column flex-md-row">
                                                    <div class="channel-name text-dark text-decoration-none">
                                                        <div class="align-items-center d-flex">
                                                            <nuxt-link :to="{ name: 'channel-slug', params: { slug: video.user.channel.slug } }" class="font-11 text-decoration-none text-dark">
                                                                <div class="d-flex img-avatar mr-1">
                                                                    <img :src="globalImageUrl( video.user.channel.avatar ? video.user.channel.avatar : 'images-asset/img_avatar.png' )" class="h-100 w-100 rounded-circle"/>
                                                                </div>
                                                            </nuxt-link>
                                                            <nuxt-link :to="{ name: 'channel-slug', params: { slug: video.user.channel.slug } }" class="text-decoration-none text-dark">
                                                                <div class="font-14 name">{{ video.user.channel.title }}</div>
                                                            </nuxt-link>
                                                        </div>
                                                    </div>
                                                    <div class="font-12 ml-md-3 mt-2 mt-md-0 text-primary">{{ globalFormatNumber(video.view,".") }} lượt xem</div>
                                                </div>
                                                <p class="font-14 font-md-16 mt-2 content text-overflow-hidden-y mb-0" v-html="video.description"></p>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </template>
                            <template v-else>
                                <div class="text-center mt-3">
                                    Không tìm thấy video nào
                                </div>
                            </template>
                        </template>
                        <template v-else>
                            <PulseLoader :color="'#da8cff'" :size="'20px'" class="text-center mt-3"/>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import AuthService from '~/services/auth.service';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

export default {
    components: {
        AuthService,
        PulseLoader,
    },
    data() {
        return {
            history: '',
            user: this.$store.state.user.data,
            searchData: this.$route.query.key_words && this.$route.name === 'profile-history' ? this.$route.query.key_words : '',
            isLoad: false,
            langStudy: this.$store.state.langStudy,
        }
    },
    created() {
        this.initHistory();
    },
    methods: {
        initHistory() {
            this.isLoad = false;
            if(this.searchData){
                this.searchVideo();
            }else{
                this.$http.get('videos/history?lang=' + this.langStudy.raw_lang.code + '&langTrans=' + this.langStudy.lang_trans.code)
                .then( response => {
                    this.history = response.data.history;
                    this.isLoad = true;
                })
            }
            
        },
        historyAction(data) {
            this.$http.post('videos/history?history_status=' + data)
            .then( response => {
                AuthService.setAccessToken(response.data.token);
                this.$store.commit('user/set', AuthService.setUser());
                this.user.history_status = data;
            })
        },
        clearHistory() {
            this.$http.post('videos/clear-history')
            .then( response => {
                this.initHistory();
            })
        },
        searchVideo() {
            if(this.searchData){
                this.$router.push({ 
                    name: 'profile-history', 
                    query: { key_words: this.searchData },
                    force: true,
                })
                this.$http.get('videos/search/history?key_words=' + this.searchData + '&lang=' + this.langStudy.raw_lang.code + '&langTrans=' + this.langStudy.lang_trans.code)
                .then( response => {
                    this.history = response.data.videoSearch;
                })
                .catch( response => {
                    this.history = '';
                })
            }else{
                this.$toastr('error', 'Vui lòng nhập tiêu đề video');
            }
            this.isLoad = true;
        }
    },
}
</script>