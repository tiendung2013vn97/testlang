<template>
    <div class="gl-homepage gl-padding-bottom" v-if="videoRecommend">
        <div class="container">
            <div class="gl-homepage__banner">
<!--                <div class="img">-->
<!--                    <img :src="globalImageUrl('images-asset/img-banner.png')" class="border-radius-10 h-100 w-100"/>-->
<!--                </div>-->
            </div>
            <div class="gl-homepage__content" v-if="videoRecommend.length > 0">
                <div class="mt-3 gl-homepage__suggest">
 <!--                   <h3 class="font-14 font-md-24 mb-0 title-border-left">Được đề xuất</h3>  -->
                    <div class="content">
                        <div class="row">
                            <template v-for="(video, index) in videoRecommend">
                                <div class="col-12 col-sm-6 col-md-4 col-lg-2 mt-3 item-video" :key="index">
                                    <div class="img-video">
                                        <nuxt-link class="img" :to="{ name: 'video-slug', params: { slug: video.slug } }">
                                            <div class="link-video">
                                                <div class="img">
                                                    <img :src="globalImageUrl(video.image)" class="border-radius-10 h-100 w-100"/>
                                                </div>
                                            </div>
                                            <div class="player"><i class="fas fa-play"></i></div>
                                        </nuxt-link>
                                        <div class="bg-opacity watch-later">
                                            <div class="overflow-hidden text-white icon-hover">
                                                <div class="py-0 d-flex">
                                                    <template v-if="video.watchLater  === 'yes'">
                                                        <span class="pr-1 font-14" @click="globalAuthDirect('index', '', $route.query, $route.params), actionVideo({ videoType: 'videoRecommend', idArr: index, id: video.id, type:'remove_watch_later' })">Đã chọn</span>
                                                        <i class="align-items-center d-flex fa-check far overflow-hidden" @click="globalAuthDirect('index', '', $route.query, $route.params), actionVideo({ videoType: 'videoRecommend', idArr: index, id: video.id, type:'remove_watch_later' })"></i>
                                                    </template>
                                                    <template v-else>
                                                        <i class="align-items-center d-flex fa-clock far overflow-hidden"  @click="globalAuthDirect('index', '', $route.query, $route.params), actionVideo({ videoType: 'videoRecommend', idArr: index, id: video.id, type:'watch_later' })"></i>
                                                    </template>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="bg-opacity font-11 time-video">
                                            {{ globalCalculateVideoTime(video.duration) }}
                                        </div>
                                    </div>
                                    <div class="info mt-1">
                                        <div class="d-flex">
                                            <nuxt-link class="flex-3 font-weight-bold font-14 font-openSans text-dark text-decoration-none text-overflow-hidden-y" :to="{ name: 'video-slug', params: { slug: video.slug } }">{{ globalLimitDescription(video.title, 80) }}</nuxt-link>
                                            <div class="cursor-pointer px-2 pt-1">
                                                <div class="position-relative">
                                                    <i @click="globalShowDrop('btnID' + index)" class="showDrop font-18 fas fa-ellipsis-v"></i>
                                                    <div :id="'btnID' + index" class="px-3 dropdown-menu showDrop d-none">
                                                        <ul class="list-style-none mb-0 pl-0">
                                                            <template v-if="video.watchLater  === 'yes'">
                                                                <li>
                                                                    <div class="text-dark" @click="globalAuthDirect('index', '', $route.query, $route.params), actionVideo({ videoType: 'videoRecommend', idArr: index, id: video.id, type:'remove_watch_later' })">Xóa khỏi danh sách xem sau</div>
                                                                </li>
                                                            </template>
                                                            <template v-else>
                                                                <li>
                                                                    <div class="text-dark" @click="globalAuthDirect('index', '', $route.query, $route.params), actionVideo({ videoType: 'videoRecommend', idArr: index, id: video.id, type:'watch_later' })">Thêm vào danh sách xem sau</div>
                                                                </li>
                                                            </template>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="d-flex flex-column">
                                            <nuxt-link :to="{ name: 'channel-slug', params: { slug: video.user.channel.slug } }" class="font-14 channel-name text-dark text-decoration-none">
                                                <div class="align-items-center d-flex">
                                                    <nuxt-link class="d-flex img-avatar mr-1" :to="{ name: 'channel-slug', params: { slug: video.user.channel.slug } }">
                                                        <img :src="globalImageUrl( video.user.channel.avatar ? video.user.channel.avatar : 'images-asset/img_avatar.png' )" class="h-100 w-100 rounded-circle"/>
                                                    </nuxt-link>
                                                    <div class="font-13 font-openSans name">{{ video.user.channel.title }}</div>
                                                </div>
                                            </nuxt-link>
                                            <div class="font-11 mt-1 text-primary">{{ globalFormatNumber(video.view,".") }} lượt xem</div>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
            <div class="gl-homepage__news"  v-if="videoLatest.length > 0">
                <div class="mt-3 gl-homepage__news">
                    <h3 class="font-14 font-md-24 mb-0 title-border-left">Mới tải lên gần đây</h3>
                    <div class="content">
                        <div class="row">
                            <template v-for="(video, index) in videoLatest">
                                <div class="col-12 col-sm-6 col-md-4 col-lg-2 mt-3 item-video" :key="index">
                                    <div class="img-video">
                                        <nuxt-link class="img" :to="{ name: 'video-slug', params: { slug: video.slug } }">
                                            <div class="link-video">
                                                <div class="img">
                                                    <img :src="globalImageUrl(video.image)" class="border-radius-10 h-100 w-100"/>
                                                </div>
                                            </div>
                                            <div class="player"><i class="fas fa-play"></i></div>
                                        </nuxt-link>
                                        <div class="bg-opacity watch-later">
                                            <div class="overflow-hidden text-white icon-hover">
                                                <div class="py-0 d-flex">
                                                    <div v-if="video.watchLater  === 'yes'">
                                                        <span class="pr-1 font-14">Đã chọn</span>
                                                    </div>
                                                    <template v-if="video.watchLater  === 'yes'">
                                                        <i class="align-items-center d-flex fa-check far overflow-hidden" @click="globalAuthDirect('index', '', $route.query, $route.params), actionVideo({ videoType: 'videoLatest', idArr: index, id: video.id, type:'remove_watch_later' })"></i>
                                                    </template>
                                                    <template v-else>
                                                        <i class="align-items-center d-flex fa-clock far overflow-hidden" @click="globalAuthDirect('index', '', $route.query, $route.params), actionVideo({ videoType: 'videoLatest', idArr: index, id: video.id, type:'watch_later' })"></i>
                                                    </template>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="bg-opacity font-11 time-video">
                                            {{ globalCalculateVideoTime(video.duration) }}
                                        </div>
                                    </div>
                                    <div class="info mt-1">
                                        <div class="d-flex">
                                            <nuxt-link class="flex-3 font-weight-bold font-14 font-openSans text-dark text-decoration-none text-overflow-hidden-y" :to="{ name: 'video-slug', params: { slug: video.slug } }">{{ globalLimitDescription(video.title, 80) }}</nuxt-link>
                                            <div class="cursor-pointer px-2 pt-1">
                                                <div class="position-relative">
                                                    <i @click="globalShowDrop('videoLatest' + index)" class="showDrop font-18 fas fa-ellipsis-v"></i>
                                                    <div :id="'videoLatest' + index" class="px-3 dropdown-menu showDrop d-none">
                                                        <ul class="list-style-none mb-0 pl-0">
                                                            <template v-if="video.watchLater  === 'yes'">
                                                                <li>
                                                                    <div class="text-dark" @click="globalAuthDirect('index', '', $route.query, $route.params), actionVideo({ videoType: 'videoLatest', idArr: index, id: video.id, type:'remove_watch_later' })">Xóa khỏi danh sách xem sau</div>
                                                                </li>
                                                            </template>
                                                            <template v-else>
                                                                <li>
                                                                    <div class="text-dark" @click="globalAuthDirect('index', '', $route.query, $route.params), actionVideo({ videoType: 'videoLatest', idArr: index, id: video.id, type:'watch_later' })">Thêm vào danh sách xem sau</div>
                                                                </li>
                                                            </template>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="d-flex flex-column">
                                            <nuxt-link :to="{ name: 'channel-slug', params: { slug: video.user.channel.slug } }" class="channel-name text-dark text-decoration-none">
                                                <div class="align-items-center d-flex">
                                                    <nuxt-link class="d-flex img-avatar mr-1" :to="{ name: 'channel-slug', params: { slug: video.user.channel.slug } }">
                                                        <img :src="globalImageUrl(video.user.channel.avatar ? video.user.channel.avatar : 'images-asset/No_Image_Available.jpg')" class="h-100 w-100 rounded-circle"/>
                                                    </nuxt-link>
                                                    <div class="font-13 font-openSans name">{{ video.user.channel.title }}</div>
                                                </div>
                                            </nuxt-link>
                                            <div class="font-11 mt-1 text-primary">{{ globalFormatNumber(video.view,".") }} lượt xem</div>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
            <template v-if="channelSub.length">
                <template v-for="(channel, index) in channelSub">
                    <div class="gl-homepage__news" :key="index" v-if="channel.hasVideo == 'yes'">
                        <div class="col-12 px-0">
                            <hr>
                        </div>
                        <div class="mt-3 gl-homepage__news">
                            <h3 class="font-20 mb-0 title-border-left">{{ channel.title }}</h3>
                            <div class="content">
                                <div class="row">
                                    <template v-for="(video, index) in videoSuggestions">
                                        <div class="col-12 col-sm-6 col-md-4 col-lg-2 mt-3 item-video" :key="index">
                                            <div class="img-video">
                                                <nuxt-link class="img" :to="{ name: 'video-slug', params: { slug: video.slug } }">
                                                    <div class="link-video">
                                                        <div class="img">
                                                            <img :src="globalImageUrl(video.image)" class="border-radius-10 h-100 w-100"/>
                                                        </div>
                                                    </div>
                                                    <div class="player"><i class="fas fa-play"></i></div>
                                                </nuxt-link>
                                                <div class="bg-opacity watch-later">
                                                    <div class="overflow-hidden text-white icon-hover">
                                                        <div class="py-0 d-flex">
                                                            <div v-if="video.watchLater  === 'yes'">
                                                                <span class="pr-1 font-14">Đã chọn</span>
                                                            </div>
                                                            <template v-if="video.watchLater  === 'yes'">
                                                                <i class="align-items-center d-flex fa-check far overflow-hidden" @click="globalAuthDirect('index', '', $route.query, $route.params), actionVideo({ videoType: 'videoSuggestions', idArr: index, id: video.id, type:'remove_watch_later' })"></i>
                                                            </template>
                                                            <template v-else>
                                                                <i class="align-items-center d-flex fa-clock far overflow-hidden" @click="globalAuthDirect('index', '', $route.query, $route.params), actionVideo({ videoType: 'videoSuggestions', idArr: index, id: video.id, type:'watch_later' })"></i>
                                                            </template>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="bg-opacity font-11 time-video">
                                                    {{ globalCalculateVideoTime(video.duration) }}
                                                </div>
                                            </div>
                                            <div class="info mt-1">
                                                <div class="d-flex">
                                                    <nuxt-link class="flex-3 font-weight-bold font-14 font-openSans text-dark text-decoration-none text-overflow-hidden-y" :to="{ name: 'video-slug', params: { slug: video.slug } }">{{ globalLimitDescription(video.title, 80) }}</nuxt-link>
                                                    <div class="cursor-pointer px-2 pt-1">
                                                        <div class="position-relative">
                                                            <i @click="globalShowDrop('videoSuggestions' + index)" class="showDrop font-18 fas fa-ellipsis-v"></i>
                                                            <div :id="'videoSuggestions' + index" class="px-3 dropdown-menu showDrop d-none">
                                                                <ul class="list-style-none mb-0 pl-0">
                                                                    <template v-if="video.watchLater  === 'yes'">
                                                                        <li>
                                                                            <div class="text-dark" @click="globalAuthDirect('index', '', $route.query, $route.params), actionVideo({ videoType: 'videoLatest', idArr: index, id: video.id, type:'remove_watch_later' })">Xóa khỏi danh sách xem sau</div>
                                                                        </li>
                                                                    </template>
                                                                    <template v-else>
                                                                        <li>
                                                                            <div class="text-dark" @click="globalAuthDirect('index', '', $route.query, $route.params), actionVideo({ videoType: 'videoLatest', idArr: index, id: video.id, type:'watch_later' })">Thêm vào danh sách xem sau</div>
                                                                        </li>
                                                                    </template>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="d-flex flex-column">
                                                    <nuxt-link :to="{ name: 'channel-slug', params: { slug: video.user.channel.slug } }" class="font-14 channel-name text-dark text-decoration-none">
                                                        <div class="align-items-center d-flex">
                                                            <nuxt-link class="d-flex img-avatar mr-1" :to="{ name: 'channel-slug', params: { slug: video.user.channel.slug } }">
                                                                <img :src="globalImageUrl(video.user.channel.avatar ? video.user.channel.avatar : 'images-asset/No_Image_Available.jpg')" class="h-100 w-100 rounded-circle"/>
                                                            </nuxt-link>
                                                            <div class="font-13 font-openSans name">{{ video.user.channel.title }}</div>
                                                        </div>
                                                    </nuxt-link>
                                                    <div class="font-11 mt-1 text-primary">{{ globalFormatNumber(video.view,".") }} lượt xem</div>
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </template>
        </div>
    </div>
</template>
<script>
import SocketService from '~/services/socket.service';

export default {
    conponents: {
        SocketService,
    },
    data() {
        return {
            videoRecommend: '',
            videoLatest: '',
            videoSuggestions: '',
            channelSub: '',
        }
    },
    created() {
        this.initVideo();
    },
    methods: {
        initVideo(){
            this.$http.get("videos/recommend?recommendLimit=12&latestLimit=12&suggestionsLimit=4&lang=" + this.$store.state.langStudy.raw_lang.code + "&langTrans=" + this.$store.state.langStudy.lang_trans.code)
            .then((response) => {
                this.channelSub = response.data.channel;
                this.videoRecommend = response.data.recommend;
                this.videoLatest = response.data.latest;
                this.videoSuggestions = response.data.suggestions;
            });
        },
        actionVideo(data) {
            this.$http.post(`videos/action/${data.id}/?type=` + data.type)
            .then((response) => {
                if(data.videoType == 'videoRecommend'){
                    if(this.videoRecommend[data.idArr].watchLater == 'yes'){
                        this.videoRecommend[data.idArr].watchLater = 'no';
                    }else{
                        this.videoRecommend[data.idArr].watchLater = 'yes';
                    }
                }else if(data.videoType == 'videoLatest'){
                    if(this.videoLatest[data.idArr].watchLater == 'yes'){
                        this.videoLatest[data.idArr].watchLater = 'no';
                    }else{
                        this.videoLatest[data.idArr].watchLater = 'yes';
                    }
                }else if(data.videoType == 'videoSuggestions'){
                    if(this.videoSuggestions[data.idArr].watchLater == 'yes'){
                        this.videoSuggestions[data.idArr].watchLater = 'no';
                    }else{
                        this.videoSuggestions[data.idArr].watchLater = 'yes';
                    }
                }
                if(data){
                    SocketService.emit("processWatchLater", { id: data.id });
                }
            })
        }
    },
    watch: {
        '$store.state.langStudy': function() {
            this.initVideo();
        }
    }
}
</script>

<style>
  .container {
    max-width: 100%;
  }
</style>