<template>
    <section class="gl-subscriptions container gl-padding-bottom">
        <template v-if="isLoad">
            <template v-if="channelSub && channelSub.length > 0">
                <template v-for="(channel, index) in channelSub">
                    <div class="row mt-3" :key="index">
                        <div class="col-12 col-lg-2 py-2">
                            <nuxt-link :to="{ name: 'channel-slug', params: { slug: channel.slug} }" class="gl-subscriptions__picture">
                                <img :src="globalImageUrl( channel.avatar ? channel.avatar : 'images-asset/No_Image_Available.jpg' )" class="w-100 h-100 rounded-circle">
                            </nuxt-link>
                        </div>
                        <div class="col-8 col-lg-8 py-2">
                            <div class="gl-subscriptions__content">
                                <nuxt-link :to="{ name: 'channel-slug', params: { slug: channel.slug} }" class="title">
                                    <h4 class="text-dark font-16 font-md-24 font-openSans text-dark mb-0">{{ channel.title }}</h4>
                                </nuxt-link>
                                <div class="link d-flex font-12 font-md-14 font-openSans mt-2">
                                    <template v-if="channel.statusSub == 'show'">
                                        <p class="mb-0">{{ globalFormatNumber(channel.subcribes, ".") }} subcribers</p>
                                        <p class="px-2 mb-0">•</p>
                                    </template>
                                    <p class="mb-0">{{ globalFormatNumber(channel.user.videos.length, ".") }} videos</p>
                                </div>
                                <div class="text overflow-hidden mt-1">
                                    <p class="mb-0 font-12 font-md-14 font-openSans">{{ channel.description }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-4 col-lg-2 py-2 pl-0 pl-lg-3">
                            <div class="gl-subscriptions__btn-subscript text-center d-sm-flex align-items-center pt-4">
                                <button type="button" class="btn btn-secondary text-uppercase w-100 font-10 font-xl-14 font-openSans">Đã đăng ký</button>
                                <!-- <nuxt-link to="" class="font-16 text-secondary ml-sm-3 mt-1 mt-sm-0">
                                <nuxt-link to="" class="font-16 text-primary ml-sm-3 mt-1 mt-sm-0">
                                    <i class="fas fa-bell"></i>
                                </nuxt-link> -->
                            </div>
                        </div>
                    </div>
                </template>
            </template>
            <template v-else>
                <div class="mt-3 text-center font-16 font-openSans">
                    Channel đăng kí trống
                </div>
            </template>
        </template>
        <template v-else>
            <div class="mt-3 text-center">
                <PulseLoader :color="'#da8cff'" :size="'20px'"/>
            </div>
        </template>
    </section>
</template>

<script type="text/javascript">
    import SocketService from '~/services/socket.service';
    import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

    export default {
        components: {
            PulseLoader,
            SocketService,
        },
        data() {
            return {
                channelSub: '',
                langStudy: this.$store.state.langStudy,
                isLoad: false,
            }
        },
        created() {
            this.initVideo();
        },
        methods: {
            initVideo(){
                this.isLoad = false;
                this.$http.get('channel/get-channel-sub')
                .then((response) => {
                    this.channelSub = response.data.channel;
                    this.isLoad = true;
                });
            },
        },
    }
</script>