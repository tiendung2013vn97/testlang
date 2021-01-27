<template v-if="channel">
    <div class="gl-homepage gl-padding-bottom">
        <div class="container">
            <div class="gl-homepage__banner position-relative">
                <template v-if="channel">
                    <div class="img">
                        <img :src="globalImageUrl(channel.banner ? channel.banner : 'images-asset/img-banner.png')" class="border-radius-10 h-100 w-100"/>
                    </div>
                </template>
                <template v-if="!isExist">
                    <div class="img">
                        <img :src="globalImageUrl('images-asset/img-banner.png')" class="border-radius-10 h-100 w-100"/>
                    </div>
                    <div class="gl-text-warning text-center">
                        Channel này không tồn tại. <nuxt-link to="/">Quay lại trang chủ</nuxt-link>
                    </div>
                </template>
                <div class="info-channel position-absolute" v-if="channel">
                    <div class="d-flex">
                        <div class="avatar mr-2 mr-md-3">
                            <img :src="globalImageUrl(channel.avatar ? channel.avatar : 'images-asset/No_Image_Available.jpg')" class="h-100 w-100 rounded-circle"/>
                        </div>
                        <div class="col px-0 info text-white">
                            <template v-if="$store.state.user.data.id != channel.user_id">
                                <div class="d-flex flex-column flex-md-row mb-2">
                                    <div class="font-md-20 text-capitalize text-decoration-none text-white">{{ channel.title }}</div>
                                    <div class="ml-md-3">
                                        <button :class="channel.subcribers.length ? 'bg-secondary' : 'bg-main'" class="btn text-white font-13 font-md-12 px-md-4 py-1" @click="globalAuthDirect('channel-slug', '', $route.query, $route.params), registerChannel()">
                                            <template v-if="channel.subcribers.length">
                                                HỦY ĐĂNG KÝ
                                            </template>
                                            <template v-else>
                                                ĐĂNG KÝ
                                            </template>
                                            <template v-if="channel.statusSub == 'show'">
                                                {{ globalFormatNumber(channel.subcribes, ".") }}
                                            </template>
                                        </button>
                                    </div>
                                </div>
                            </template>
                            <!-- <p class="mb-2 content font-10 overflow-hidden">
                                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sunt officiis dolor voluptatibus, voluptas iste cum reiciendis tenetur laboriosam earum.
                            </p>
                            <div class="d-flex font-12">
                                <div class="align-items-center border-right d-flex flex-column justify-content-center pr-2">
                                    <span>12,342</span> videos
                                </div>
                                <div class="align-items-center border-right d-flex flex-column justify-content-center px-2"><span>123,111</span> lượt xem</div>
                                <div class="align-items-center d-flex flex-column justify-content-center pl-2"><span>1,132</span>đăng ký</div>
                            </div> -->
                            <template v-else>
                                <div class="d-flex align-items-center mt-2 mt-md-0">
                                    <nuxt-link :to="{ name: 'profile-video-upload' }">
                                        <button class="bg-youtube text-white btn rounded-0 px-2 d-inline-block mx-1">
                                            <i class="fas fa-upload"></i> Upload Video
                                        </button>
                                    </nuxt-link>
                                    <nuxt-link :to="{ name: 'profile-channel-update-slug', params: { slug: channel.slug } }">
                                        <button class="bg-youtube text-white btn rounded-0 px-2 d-inline-block mx-1">
                                            <i class="fas fa-cog"></i> Cài đặt
                                        </button>
                                    </nuxt-link>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
            <div class="gl-nav" v-if="channel">
                <ul id="" class="d-flex gl-nav__title list-style-none pl-0 position-relative">
                    <li class="item-nav" v-for="(tab, index) in tabs" @click="selectTab(index)" :key="index">
                        <div class="cursor-pointer font-16 font-md-20 font-openSans px-2 px-lg-5 px-md-4 py-1 py-md-2 tab-click text-center" :class="{ active: navActive === index }">{{ tab }}</div>
                    </li>
                </ul>
                <div class="gl-nav__content mt-2">
                    <div class="tab-homepage" v-if="navActive === 0">
                        <template v-if="isLoad">
                            <div class="d-flex" v-if="popularVideos && popularVideos.length > 0">
                                <div class="col gl-homepage__content px-0">
                                    <div class="mt-3 gl-homepage__suggest">
                                        <h3 class="font-24 mb-0 title-border-left">Video được đề xuất</h3>
                                        <div class="content">
                                            <div class="row">
                                                <template v-for="(video, index) in popularVideos">
                                                    <div class="col-12 col-sm-6 col-md-4 col-lg-2 mt-3 item-video" :key="index">
                                                        <div class="img-video">
                                                            <nuxt-link class="link-video w-100" :to="{ name: 'video-slug', params: { slug: video.slug } }">
                                                                <div class="img">
                                                                    <img :src="globalImageUrl(video.image ? video.image : 'images-asset/No_Image_Available.jpg')" class="border-radius-10 h-100 w-100"/>
                                                                </div>
                                                                <div class="player"><i class="fas fa-play"></i></div>
                                                            </nuxt-link>
                                                            <div class="bg-opacity watch-later">
                                                                <div class="overflow-hidden text-white icon-hover">
                                                                    <div class="py-0 d-flex">
                                                                        <template v-if="video.watchLater  === 'yes'">
                                                                            <span class="pr-1 font-14" @click="globalAuthDirect('index', '', $route.query, $route.params), actionVideoHome({ videoType: 'videoPopular', idArr: index, id: video.id, type:'remove_watch_later' })">Đã chọn</span>
                                                                            <i class="align-items-center d-flex fa-check far overflow-hidden" @click="globalAuthDirect('index', '', $route.query, $route.params), actionVideoHome({ videoType: 'videoPopular', idArr: index, id: video.id, type:'remove_watch_later' })"></i>
                                                                        </template>
                                                                        <template v-else>
                                                                            <i class="align-items-center d-flex fa-clock far overflow-hidden"  @click="globalAuthDirect('index', '', $route.query, $route.params), actionVideoHome({ videoType: 'videoPopular', idArr: index, id: video.id, type:'watch_later' })"></i>
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
                                                                <nuxt-link class="font-weight-bold font-14 font-openSans flex-3 text-dark text-decoration-none text-overflow-hidden-y" :to="{ name: 'video-slug', params: { slug: video.slug } }">{{ video.title }}}</nuxt-link>
                                                                <div class="pl-3">
                                                                    <div class="position-relative">
                                                                        <i @click="globalShowDrop('popularVideos' + index)" class="cursor-pointer showDrop fas fa-ellipsis-v"></i>
                                                                        <div :id="'popularVideos' + index" class="px-3 dropdown-menu showDrop d-none">
                                                                            <ul class="list-style-none mb-0 pl-0">
                                                                                <li v-if="video.watchLater === 'yes'">
                                                                                    <div class="text-dark cursor-pointer" @click="globalAuthDirect('channel-slug', '', $route.query, $route.params), actionVideoHome({ videoType: 'videoPopular', idArr: index, id: video.id, type:'remove_watch_later' })">
                                                                                        <i class="fas fa-clock"></i> Xóa vào danh sách xem sau
                                                                                    </div>
                                                                                </li>
                                                                                <li v-else>
                                                                                    <div class="text-dark cursor-pointer" @click="globalAuthDirect('channel-slug', '', $route.query, $route.params), actionVideoHome({ videoType: 'videoPopular', idArr: index, id: video.id, type:'watch_later' })">
                                                                                        <i class="fas fa-clock"></i> Thêm khỏi danh sách xem sau
                                                                                    </div>
                                                                                </li>
                                                                                <template v-if="$store.state.user.data.id == channel.user_id">
                                                                                    <li>
                                                                                        <nuxt-link :to="{ name: 'profile-video-update-slug', params: { slug:  video.slug } }" class="text-dark">
                                                                                            <i class="fas fa-pencil-alt"></i> Chỉnh sửa video
                                                                                        </nuxt-link>
                                                                                    </li>
                                                                                </template>
                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="d-flex flex-column">
                                                                <nuxt-link to="" class="channel-name text-dark text-decoration-none">
                                                                    <div class="align-items-center d-flex">
                                                                        <div class="d-flex img-avatar mr-1">
                                                                            <img :src="globalImageUrl(video.user.channel.avatar ? video.user.channel.avatar : 'images-asset/No_Image_Available.jpg')" class="h-100 w-100 rounded-circle"/>
                                                                        </div>
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
                                    <div class="mt-3 gl-homepage__hot" v-if="featuredVideos && featuredVideos.length > 0">
                                        <h3 class="font-24 mb-0 title-border-left">Video tải lên</h3>
                                        <div class="content">
                                            <div class="row">
                                                <template v-for="(video, index) in featuredVideos">
                                                    <div class="col-12 col-sm-6 col-md-4 col-lg-2 mt-3 item-video" :key="index">
                                                        <div class="img-video">
                                                            <nuxt-link class="link-video w-100" :to="{ name: 'video-slug', params: { slug: video.slug } }">
                                                                <div class="img">
                                                                    <img :src="globalImageUrl(video.image ? video.image : 'images-asset/No_Image_Available.jpg')" class="border-radius-10 h-100 w-100"/>
                                                                </div>
                                                                <div class="player"><i class="fas fa-play"></i></div>
                                                            </nuxt-link>
                                                            <div class="bg-opacity watch-later">
                                                                <div class="overflow-hidden text-white icon-hover">
                                                                    <div class="py-0 d-flex">
                                                                        <template v-if="video.watchLater  === 'yes'">
                                                                            <span class="pr-1 font-14" @click="globalAuthDirect('index', '', $route.query, $route.params), actionVideoHome({ videoType: 'videoFeatured', idArr: index, id: video.id, type:'remove_watch_later' })">Đã chọn</span>
                                                                            <i class="align-items-center d-flex fa-check far overflow-hidden" @click="globalAuthDirect('index', '', $route.query, $route.params), actionVideoHome({ videoType: 'videoFeatured', idArr: index, id: video.id, type:'remove_watch_later' })"></i>
                                                                        </template>
                                                                        <template v-else>
                                                                            <i class="align-items-center d-flex fa-clock far overflow-hidden"  @click="globalAuthDirect('index', '', $route.query, $route.params), actionVideoHome({ videoType: 'videoFeatured', idArr: index, id: video.id, type:'watch_later' })"></i>
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
                                                                <nuxt-link class="font-weight-bold font-14 font-openSans flex-3 text-dark text-decoration-none text-overflow-hidden-y" :to="{ name: 'video-slug', params: { slug: video.slug } }">{{ video.title }}}</nuxt-link>
                                                                <div class="pl-3">
                                                                    <div class="position-relative">
                                                                        <i @click="globalShowDrop('featuredVideos' + index)" class="cursor-pointer showDrop fas fa-ellipsis-v"></i>
                                                                        <div :id="'featuredVideos' + index" class="px-3 dropdown-menu showDrop d-none">
                                                                            <ul class="list-style-none mb-0 pl-0">
                                                                                <li v-if="video.watchLater === 'yes'">
                                                                                    <div class="text-dark cursor-pointer" @click="globalAuthDirect('channel-slug', '', $route.query, $route.params), actionVideoHome({ videoType: 'videoFeatured', idArr: index, id: video.id, type:'remove_watch_later' })">
                                                                                        <i class="fas fa-clock"></i> Xóa vào danh sách xem sau
                                                                                    </div>
                                                                                </li>
                                                                                <li v-else>
                                                                                    <div class="text-dark cursor-pointer" @click="globalAuthDirect('channel-slug', '', $route.query, $route.params), actionVideoHome({ videoType: 'videoFeatured', idArr: index, id: video.id, type:'watch_later' })">
                                                                                        <i class="fas fa-clock"></i> Thêm khỏi danh sách xem sau
                                                                                    </div>
                                                                                </li>
                                                                                <template v-if="$store.state.user.data.id == channel.user_id">
                                                                                    <li>
                                                                                        <nuxt-link :to="{ name: 'profile-video-update-slug', params: { slug:  video.slug } }" class="text-dark">
                                                                                            <i class="fas fa-pencil-alt"></i> Chỉnh sửa video
                                                                                        </nuxt-link>
                                                                                    </li>
                                                                                </template>
                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="d-flex flex-column">
                                                                <nuxt-link to="" class="channel-name text-dark text-decoration-none">
                                                                    <div class="align-items-center d-flex">
                                                                        <div class="d-flex img-avatar mr-1">
                                                                            <img :src="globalImageUrl(video.user.channel.avatar ? video.user.channel.avatar : 'images-asset/No_Image_Available.jpg')" class="h-100 w-100 rounded-circle"/>
                                                                        </div>
                                                                        <div class="font-12 font-openSans name">{{ video.user.channel.title }}</div>
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
                                <!-- <div class="d-none d-lg-block mt-3 mb-2 pr-0 related-channel col-2">
                                    <ul class="list-style-none pl-0">
                                        <span class="d-inline-block font-18 font-weight-bold mb-2">Kênh liên quan</span>
                                        <li class="pb-2">
                                            <nuxt-link to="" class="channel-name text-dark text-decoration-none">
                                                <div class="align-items-center d-flex">
                                                    <div class="d-flex img-avatar mr-1">
                                                        <img :src="globalImageUrl( 'images-asset/No_Image_Available.jpg' )" class="h-100 w-100 rounded-circle"/>
                                                    </div>
                                                    <div class="font-14 name">Channel Admin</div>
                                                </div>
                                            </nuxt-link>
                                        </li>
                                        <li class="pb-2">
                                            <nuxt-link to="" class="channel-name text-dark text-decoration-none">
                                                <div class="align-items-center d-flex">
                                                    <div class="d-flex img-avatar mr-1">
                                                        <img :src="globalImageUrl( 'images-asset/No_Image_Available.jpg' )" class="h-100 w-100 rounded-circle"/>
                                                    </div>
                                                    <div class="font-14 name">Channel Admin</div>
                                                </div>
                                            </nuxt-link>
                                        </li>
                                        <li class="pb-2">
                                            <nuxt-link to="" class="channel-name text-dark text-decoration-none">
                                                <div class="align-items-center d-flex">
                                                    <div class="d-flex img-avatar mr-1">
                                                        <img :src="globalImageUrl( 'images-asset/No_Image_Available.jpg' )" class="h-100 w-100 rounded-circle"/>
                                                    </div>
                                                    <div class="font-14 name">Channel Admin</div>
                                                </div>
                                            </nuxt-link>
                                        </li>
                                    </ul>
                                </div> -->
                            </div>
                            <div class="text-center" v-else>
                                Không tồn tại video nào
                            </div>
                        </template>
                        <template v-else>
                            <div class="text-center">
                                <PulseLoader :color="'#da8cff'" :size="'20px'"/>
                            </div>
                        </template>
                    </div>
                    <div class="tab-video" v-if="navActive === 1">
                        <template v-if="isLoad">
                            <div class="list-video" v-if="videos.data.length > 0">
                                <div class="row">
                                    <template v-for="(video, index) in videos.data">
                                        <div class="col-12 col-sm-6 col-md-4 col-lg-2 mt-3 item-video" :key="index">
                                            <div class="img-video">
                                                <nuxt-link class="link-video w-100" :to="{ name: 'video-slug', params: { slug: video.slug } }">
                                                    <div class="img">
                                                        <img :src="globalImageUrl(video.image ? video.image : 'images-asset/No_Image_Available.jpg')" class="border-radius-10 h-100 w-100"/>
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
                                                    <nuxt-link class="font-weight-bold font-14 font-openSans flex-3 text-dark text-decoration-none text-overflow-hidden-y" :to="{ name: 'video-slug', params: { slug: video.slug } }">
                                                        {{ video.title }}
                                                    </nuxt-link>
                                                    <div class="pl-3">
                                                        <div class="position-relative">
                                                            <i @click="globalShowDrop('videoAll' + index)" class="cursor-pointer showDrop fas fa-ellipsis-v"></i>
                                                            <div :id="'videoAll' + index" class="px-3 dropdown-menu showDrop d-none">
                                                                <ul class="list-style-none mb-0 pl-0">
                                                                    <template v-if="video.status == 'active'">
                                                                        <template v-if="video.watchLater === 'yes'">
                                                                            <li>
                                                                                <div class="text-dark" @click="globalAuthDirect('index', '', $route.query, $route.params), actionVideo({ videoType: 'videoAll', idArr: index, id: video.id, type: 'remove_watch_later' })">
                                                                                    <i class="fas fa-clock"></i>Xóa khỏi danh sách xem sau
                                                                                </div>
                                                                            </li>
                                                                        </template>
                                                                        <template v-else>
                                                                            <li>
                                                                                <div class="text-dark" @click="globalAuthDirect('index', '', $route.query, $route.params), actionVideo({ videoType: 'videoAll', idArr: index, id: video.id, type: 'watch_later' })">
                                                                                    <i class="fas fa-clock"></i>Thêm vào danh sách xem sau
                                                                                </div>
                                                                            </li>
                                                                        </template>
                                                                    </template>
                                                                    <template v-if="$store.state.user.data.id == channel.user_id">
                                                                        <li>
                                                                            <nuxt-link :to="{ name: 'profile-video-update-slug', params: { slug:  video.slug } }">
                                                                                <i class="fas fa-pencil-alt"></i>
                                                                            </nuxt-link>
                                                                            <nuxt-link class="text-dark" :to="{ name: 'profile-video-update-slug', params: { slug:  video.slug } }">
                                                                                Chỉnh sửa video
                                                                            </nuxt-link>
                                                                        </li>
                                                                    </template>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="d-flex flex-column">
                                                    <nuxt-link to="" class="channel-name text-dark text-decoration-none">
                                                        <div class="align-items-center d-flex">
                                                            <div class="d-flex img-avatar mr-1">
                                                                <img :src="globalImageUrl( 'images-asset/No_Image_Available.jpg' )" class="h-100 w-100 rounded-circle"/>
                                                            </div>
                                                            <div class="font-13 font-openSans name">{{ video.user.channel.title }}</div>
                                                        </div>
                                                    </nuxt-link>
                                                    <div class="font-12 mt-1 text-primary">{{ globalFormatNumber(video.view,".") }} lượt xem</div>
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                                <div class="pb-3">
                                    <Pagination :tablePagination="videos" :paramsPage="current_page" @changePage="changePage" isScroll="no"/>
                                </div>
                            </div>
                            <div class="text-center" v-else>
                                Không tồn tại video nào
                            </div>
                        </template>
                        <template v-else>
                            <div class="text-center">
                                <PulseLoader :color="'#da8cff'" :size="'20px'"/>
                            </div>
                        </template>
                    </div>
                    <div class="tab-about-me" v-if="navActive === 2">
                        <template v-if="isLoad">
                            <h4 class="text-center font-18 font-md-20 font-openSans font-weight-bold">Giới thiệu về {{ channel.title }}</h4>
                            <p class="font-14 font-md-16 font-openSans">{{ channel.description }}</p>
                        </template>
                        <template v-else>
                            <div class="text-center">
                                <PulseLoader :color="'#da8cff'" :size="'20px'"/>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import SocketService from '~/services/socket.service';
import Pagination from '~/components/common/pagination/VuePagination.vue';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

export default {
    components: {
        SocketService,
        Pagination,
        PulseLoader,
    },
    data() {
        return {
            navActive: 0,
            tabs: ['Trang chủ', 'Videos', 'Về tôi'],
            isSearchOnMobile: false,
            channel: '',
            videos: '',
            featuredVideos: '',
            popularVideos: '',
            isExist: true,
            current_page: 1,
            langStudy: this.$store.state.langStudy,
            isLoad: false,
        }
    },
    created() {
        this.initChannel();
    },
    methods: {
        initChannel(){
            this.isLoad = false;
            this.$http.get(`channel/detail/${this.$route.params.slug}/?limitFeatured=8&limitPopular=8` + `&page=` + (this.current_page) + `&per_page=40&lang=` + this.langStudy.raw_lang.code + `&langTrans=` + this.langStudy.lang_trans.code)
            .then((response) => {
                this.channel = response.data.channel;
                this.featuredVideos = response.data.featuredVideos;
                this.popularVideos = response.data.popularVideos;
                this.videos = response.data.data;
                this.isLoad = true;
            })
            .catch((response) => {
                this.isExist = false;
                this.isLoad = true;
            });
        },
        registerChannel(){
            this.$http.post(`channel/sub/${this.channel.id}`)
            .then((response) => {
                SocketService.emit('processSubcribe', { user_id: this.$store.state.user.data.id, id: this.channel.id });
                this.initChannel();
            });
        },
        actionVideoHome(data){
            this.$http.post(`videos/action/${data.id}/?type=` + data.type)
            .then((response) => {
                if(data.videoType == 'videoFeatured'){
                    if(this.featuredVideos[data.idArr].watchLater == 'yes'){
                        this.featuredVideos[data.idArr].watchLater = 'no';
                    }else{
                        this.featuredVideos[data.idArr].watchLater = 'yes';
                    }
                }else if(data.videoType == 'videoPopular'){
                    if(this.popularVideos[data.idArr].watchLater == 'yes'){
                        this.popularVideos[data.idArr].watchLater = 'no';
                    }else{
                        this.popularVideos[data.idArr].watchLater = 'yes';
                    }
                }
                SocketService.emit("processWatchLater", {id: data.id})
            })
        },
        actionVideo(data) {
            this.$http.post(`videos/action/${data.id}/?type=` + data.type)
            .then((response) => {
                if(this.videos.data[data.idArr].watchLater == 'yes'){
                    this.videos.data[data.idArr].watchLater = 'no';
                }else{
                    this.videos.data[data.idArr].watchLater = 'yes';
                }
                SocketService.emit("processWatchLater", { id: data.id })
            })
        },
        showSearchBoxOnMobile(){
            this.isSearchOnMobile = !this.isSearchOnMobile;
        },
        selectTab(index){
            this.navActive = index;
        },
        changePage: function (page) {
            if (page === 'prev') {
                this.gotoPreviousPage();
            } else if (page === 'next') {
                this.gotoNextPage();
            } else {
                this.gotoPage(page);
            }
        },
        gotoPreviousPage: function () {
            if (this.current_page > 1) {
                this.current_page--
            }
        },
        gotoNextPage: function () {
            if (this.current_page < this.videos.last_page) {
                this.current_page++
            }
        },
        gotoPage: function (page) {
            if (page != this.current_page && (page > 0 && page <= this.videos.last_page)) {
                this.current_page = page;
            }
        },
    },
    mounted() {
        const socket = SocketService.socket;
        socket.on('updateSubcribe', (data) => {
            if(data.id == this.channel.id && this.$route.name == 'channel-slug'){
                this.initChannel();
            }
        });
    },
    watch: {
        'navActive': function(){
            this.initChannel();
        },
        'current_page': function(){
            this.initChannel();
        },
    },
};
</script>