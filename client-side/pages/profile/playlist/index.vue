<template>
    <section class="gl-play-list container-fluid gl-container transition-normal pr-lg-0 px-0">
        <div class="col-12 px-0 gl-bg-3 background-color-fafafa gl-min-vh d-lg-flex">
            <div class="gl-play-list__info col-xl-4 col-lg-5 py-3 background-color-fafafa position-relative">
                <nuxt-link to="" class="img mx-xl-4 mx-2 position-relative cursor-pointer d-lg-block d-none">
                    <img :src="globalImageUrl('images-asset/channels4_banner.jpg')">
                    <div class="position-absolute w-100 py-2 text-center text-uppercase text-white">
                        <i class="fas fa-play mr-2"></i> phát tất cả
                    </div>
                </nuxt-link>
                <nuxt-link to class="m-lg-2 my-2 title mx-xl-4 text-body">
                    Watch Later Playlist
                </nuxt-link>
                <div class="mx-xl-4 mx-lg-2 note" v-if="playlist.length > 0">
                    {{ playlist.length }} video cập nhật lần cuối vào {{ globalFormatDate(lastUpdate[0].updatedAt) }}
                </div>
                <div class="d-lg-none mobile-btn position-absolute top-center d-sm-block d-none">
                    <button class="btn btn-danger" type="button">
                        <i class="fas fa-play text-white"></i>
                    </button>
                </div>
            </div>
            <div class="gl-play-list__list col-xl-8 col-lg-7 background-color-f1f1f1 py-3" v-if="isLoad">
                <template v-if="playlist && playlist.length">
                    <template v-for="(video,index) in playlist">
                        <div class="channel d-md-flex mb-3 position-relative" :key="index">
                            <div class="video-preview">
                                <nuxt-link class="d-block w-100" :to="{ name: 'video-slug', params: {slug: video.slug} }">
                                    <img :src="globalImageUrl(video.image ? video.image : 'images-asset/No_Image_Available.jpg')"
                                        class="image d-block w-100">
                                </nuxt-link>
                            </div>
                            <div class="position-relative ml-md-3 mt-2 mt-md-0 video-description">
                                <nuxt-link :to="{ name: 'video-slug', params: {slug: video.slug} }" class="d-block font-13 font-md-18 font-weight-bold mr-md-4 my-md-1 pr-md-2 text-dark">
                                    {{ video.title }}
                                </nuxt-link>
                                <div class="text-secondary font-12 my-md-2 my-1">
                                    <span>
                                        <nuxt-link class="font-11 font-md-14 text-dark" :to="{ name: 'channel-slug', params: {slug: video.user.channel.slug} }">{{ video.user.channel.title }}</nuxt-link> <i class="fas fa-check-circle"></i>
                                    </span>
                                    <span>
                                        {{ globalFormatNumber(video.view, ".") }} lượt xem
                                    </span>
                                    <span class="mx-1">
                                        •
                                    </span>
                                    <span>
                                        {{ globalFormatDate(video.createdAt) }}
                                    </span>
                                </div>
                                <div class="font-13 d-none d-md-block" v-html="video.description ? globalLimitDescription(video.description ? video.description : '', 150) : '' ">
                                    <p></p>
                                </div>
                            </div>
                            <div class="delete-list-button">
                                <button type="button" class="d-flex justify-content-center align-items-center btn btn-danger" @click="globalAuthDirect('profile-playlist', '', $route.query, $route.params), actionVideo({id: video.id, type: 'remove_watch_later'})">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </div>
                    </template>
                </template>
                <template v-else>
                    <div class="channel d-md-flex mb-3 position-relative" :key="index">
                        Không tìm thấy video nào
                    </div>
                </template>
            </div>
            <div class="gl-play-list__list col-xl-8 col-lg-7 background-color-f1f1f1 py-3" v-else>
                <PulseLoader :color="'#da8cff'" :size="'20px'"/>
            </div>
        </div>
    </section>
</template>
<script>
    import SocketService from '~/services/socket.service';
    import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

    export default {
        components: {
            PulseLoader,
            SocketService,
        },
        data() {
            return {
                playlist: '',
                lastUpdate: '',
                langStudy: this.$store.state.langStudy,
                isLoad: false,
            }
        },
        created() {
            this.initPlaylist();
        },
        methods: {
            initPlaylist (){
                this.isLoad = false;
                this.$http.get("videos/watch-later?lang=" + this.langStudy.raw_lang.code + "&langTrans=" + this.langStudy.lang_trans.code)
                .then( response => {
                    this.lastUpdate = response.data.findWatchLater;
                    this.playlist = response.data.watchlater;
                    this.isLoad = true;
                })
            },
            actionVideo(data){
                this.$http.post(`videos/action/${data.id}/?type=` + data.type)
                .then((response) => {
                    this.initPlaylist();
                })
            },
        },
        mounted() {
            const socket = SocketService.socket;
            socket.on('updateWatchLater', (data) => {
                if(this.$route.name == 'profile-playlist') {
                    this.initPlaylist();
                }
            });
        },
    }
</script>