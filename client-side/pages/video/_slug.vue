<template>
    <div class="gl-padding-bottom">
        <div class="gl-video-detail">
            <Player ref="videoPlayer" v-if="videoDetail.link" :video="videoDetail"/>
            <div class="mt-3 row mx-0" v-if="!isLoad">
                <div class="col-12 col-lg-7 col-xl-8">
                    <div class="gl-video-detail__content">
                        <div class="title-video">
                            <p class="font-24 font-weight-bold text-dark">{{ videoDetail.title }}</p>
                        </div>
                        <div class="border-bottom d-sm-flex pb-1">
                            <div class="flex-1 mb-1 mb-sm-0 views">
                                <div class="align-items-center d-flex font-13">
                                    <span class="pr-1">{{ globalFormatNumber("" + videoDetail.view,".") }}</span>lượt xem
                                    <i class="font-4 px-1 fas fa-circle"></i>
                                    <span>{{ globalFormatDate(videoDetail.createdAt) }}</span>
                                </div>
                            </div>
                            <div class="d-flex flex-1 justify-content-sm-end justify-content-start social">
                                <div class="d-flex">
                                    <template v-if="videoFeel">
                                        <div class="like">
                                            <i class="cursor-pointer" :class="videoFeel.type === 'like' ? `fas fa-thumbs-up` : `far fa-thumbs-up`" @click="globalAuthDirect('video-slug', '', $route.query, $route.params), actionVideo('like')"></i>
                                            <span class="font-14">{{ globalFormatNumber(videoDetail.likes, ".") }}</span>
                                        </div>
                                        <div class="mx-3 unlike">
                                            <i class="cursor-pointer" :class="videoFeel.type === 'dislike' ? `fas fa-thumbs-down` : `far fa-thumbs-down`" @click="globalAuthDirect('video-slug', '', $route.query, $route.params), actionVideo('dislike')"></i>
                                            <span class="font-14">{{ globalFormatNumber(videoDetail.dislikes, ".") }}</span>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <div class="like">
                                            <i class="cursor-pointer far fa-thumbs-up" @click="actionVideo('like')"></i>
                                            <span class="font-14">{{ globalFormatNumber(videoDetail.likes, ".") }}</span>
                                        </div>
                                        <div class="mx-3 unlike">
                                            <i class="cursor-pointer far fa-thumbs-down" @click="actionVideo('dislike')"></i>
                                            <span class="font-14">{{ globalFormatNumber(videoDetail.dislikes, ".") }}</span>
                                        </div>
                                    </template>
                                    <template v-if="videoLater">
                                        <div class="share" @click="globalAuthDirect('video-slug', '', $route.query, $route.params), actionVideo('remove_watch_later')">
                                            <i class="cursor-pointer" :class="videoLater.type === 'watch_later' ? 'fas fa-save' : 'far fa-save'"></i>
                                            <span class="font-14">Save</span>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <div class="share" @click="globalAuthDirect('video-slug', '', $route.query, $route.params), actionVideo('watch_later')">
                                            <i class="cursor-pointer far fa-save"></i>
                                            <span class="font-14">Save</span>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                        <div class="border-bottom pb-3 info-video mt-3">
                            <div class="d-flex">
                                <nuxt-link :to="{ name: 'channel-slug', params: { slug: videoDetail.user.channel.slug } }" class="">
                                    <div class="avatar">
                                        <img :src="globalImageUrl(videoDetail.user.channel.avatar ? videoDetail.user.channel.avatar : 'images-asset/No_Image_Available.jpg')" class="h-100 w-100 rounded-circle"/>
                                    </div>
                                </nuxt-link>
                                <div class="ml-2 flex-1">
                                    <div class="">
                                        <div class="d-flex mb-2">
                                            <nuxt-link :to="{ name: 'channel-slug', params: { slug: videoDetail.user.channel.slug } }" class="flex-1 font-md-20 font-weight-bold name text-dark text-decoration-none">
                                                {{ videoDetail.user.channel.title }}
                                            </nuxt-link>
                                            <div class="ml-2">
                                                <template v-if="channel.user_id === user.id">
                                                    <nuxt-link :to="{ name: 'profile-video-update-slug', params: { slug: videoDetail.slug } }">
                                                        <button type="button" class="bg-youtube btn btn-primary">
                                                            Chỉnh sửa
                                                        </button>
                                                    </nuxt-link>
                                                </template>
                                                <template v-else>
                                                    <button type="button" :class="channel.subcribers.length ? 'border-secondary bg-secondary' : 'bg-main'" class="font-12 btn btn-danger" @click="globalAuthDirect('video-slug', '', $route.query, $route.params), registerChannel()">
                                                        <template v-if="channel.subcribers.length">
                                                            HỦY ĐĂNG KÝ {{ channel.statusSub == 'show' ? globalFormatNumber(channel.subcribes, ".") : '' }}
                                                        </template>
                                                        <template v-else>
                                                            ĐĂNG KÝ {{ channel.statusSub == 'show' ? globalFormatNumber(channel.subcribes, ".") : '' }}
                                                        </template>
                                                    </button>
                                                </template>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- <p class="font-14 mt-2 description" v-html="!showMoreDescription ? videoDetail.description : globalLimitDescription(videoDetail.description ? videoDetail.description : '', limitDescription)"></p> -->
                                    <div class="description gl-refont">
                                        <p v-html="!showMoreDescription ? videoDetail.description : globalLimitDescription(videoDetail.description ? videoDetail.description : '', limitDescription)">
                                        </p>
                                        <template v-if="!showMoreDescription">
                                            <div class="cat d-flex mt-2">
                                                <div class="cat-name pr-sm-5 pr-2">
                                                    Danh mục:
                                                </div>
                                                <div class="cat-content">
                                                    <template v-for="(category, index) in categories">
                                                        <div :key="index">
                                                            <nuxt-link :to="{ name: 'search', query: {category: category.id} }">{{ category.title }}</nuxt-link>
                                                        </div>
                                                    </template>
                                                </div>
                                            </div>
                                        </template>
                                    </div>

                                    <template v-if="videoDetail.description.length > limitDescription">
                                        <div @click="showHideDescription">
                                            <button class="btn-showmore font-10 px-5">{{ showMoreDescription ? 'HIỂN THỊ THÊM' : 'ẨN BỚT' }}</button>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                        <div class="mt-3 comment-video">
                            <div class="">Bình luận {{ videoDetail.comments ? videoDetail.comments : '0' }}</div>
                            <template v-if="globalObjectLength(user)">
                                <div class="mt-3 d-flex">
                                    <div class="">
                                        <div class="avatar">
                                            <img :src="globalImageUrl(user.avatar ? user.avatar : 'images-asset/No_Image_Available.jpg')" class="h-100 w-100 rounded-circle"/>
                                        </div>
                                    </div>
                                    <div class="ml-2 flex-1">
                                        <div class="font-20 font-weight-bold text-dark">{{ user.username }}</div>
                                        <div class="mt-2 comment">
                                            <textarea placeholder="Viết bình luận" class="bg-gray border-0 border-radius-10 p-2 w-100" v-model="txtComment.content"></textarea>
                                        </div>
                                        <div class="d-flex justify-content-end">
                                            <div class="">
                                                <button class="btn btn-success" type="button" :disabled="btnComment" @click="sendComment">Nhận xét</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <div class="alert-warning p-2 my-2">
                                    Vui lòng đăng nhập để gửi bình luận.
                                </div>
                            </template>
                            <div class="ml-3 list-comment">
                                <template v-for="cmt in comments.data">
                                    <Comment :cmt="cmt" @updateVideo="initVideo" :key="cmt.id"/>
                                </template>
                            </div>
                            <Pagination :tablePagination="comments" :paramsPage="current_page" @changePage="changePage" isScroll="no"/>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-lg mt-3 mt-lg-0">
                    <div class="list">
                        <template v-for="(video, index) in videoRecommend">
                            <div class="item-video mt-3 mx-0 row" :key="index">
                                <div class="relative-video-img-container">
                                    <div class="img-video">
                                        <nuxt-link class="link-video" :to="{ name: 'video-slug', params: { slug: video.slug } }">
                                            <div class="img">
                                                <img :src="globalImageUrl(video.image ? video.image : 'images-asset/No_Image_Available.jpg')" class="img-relative-video"/>
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
                                <div class="relative-video-info-container">
                                    <div class="info">
                                        <div class="name">
                                            <nuxt-link class="font-14 font-weight-bold mb-1 pr-2 text-dark text-decoration-none" to="#">
                                                {{ video.title }}
                                            </nuxt-link>
                                        </div>
                                        <div class="">
                                            <div class="not-important-text">{{ globalFormatNumber(video.view, ".") }} lượt xem</div>
                                            <div class="channel-name text-dark text-decoration-none">
                                                <div class="align-items-center d-flex">
                                                    <nuxt-link class="chanel-link-text" :to="{ name: 'channel-slug', params: { slug: video.user.channel.slug } }">
                                                        <div >{{ video.user.channel.title }}</div>
                                                    </nuxt-link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Player from '~/components/client/video/Player.vue';
import Pagination from '~/components/common/pagination/VuePagination.vue';
import Comment from '~/components/client/video/Comment.vue';
import SocketService from '~/services/socket.service';

export default {
    components: {
        Player,
        Pagination,
        Comment,
        SocketService,
    },
    data() {
        return {
            videoDetail: {
                user: {
                    channel:'',
                },
                Userpayment: '',
            },
            isLoad: true,
            channel: {
                subcribers:'',
            },
            videoRecommend: '',
            comments: '',
            current_page: 1,
            user: this.$store.state.user.data,
            txtComment: {
                content: '',
            },
            btnComment: true,
            categories: '',
            videoFeel: '',
            videoLater: '',
            showMoreDescription: false,
            limitDescription: 1000,
            firstTime: true,
        }
    },
    created() {
        this.initHistory();        
    },
    methods: {
        initVideo() {
            let thiz=this
            this.$http.get('videos/detail/' + this.$route.params.slug)
            .then( response => {
                thiz.isLoad = false;
                thiz.videoDetail = response.data.data;
                let dataLanguage = {
                    raw_lang: thiz.videoDetail.raw_lang,
                    lang_trans: thiz.videoDetail.translate_lang,
                }
                // this.initLanguages(dataLanguage);
                if(thiz.firstTime){
                    thiz.initRecommend();
                }
                thiz.initComments();
                thiz.firstTime = false;
                thiz.categories = thiz.videoDetail.categories;
                thiz.channel = response.data.channel;
                thiz.videoFeel = response.data.videoFeel;
                thiz.videoLater = response.data.videoLater;
                thiz.videoDetail.subtitles = response.data.subTitles;
                thiz.videoDetail.userPayment = response.data.userPayment;
                for(let i in thiz.videoDetail.subtitles) {
                    thiz.videoDetail.subtitles[i].raw_mean = JSON.parse(thiz.videoDetail.subtitles[i].raw_mean);
                    thiz.videoDetail.subtitles[i].pronunciation = JSON.parse(thiz.videoDetail.subtitles[i].pronunciation);
                    thiz.videoDetail.subtitles[i].displayTime=`${thiz.globalCalculateVideoTime(thiz.videoDetail.subtitles[i].start)} - ${thiz.globalCalculateVideoTime(thiz.videoDetail.subtitles[i].end)}`
                    // this.videoDetail.subtitles[i].full_mean_display=this.videoDetail.subtitles[i].full_mean.replace(/\.\./g," ")
                    thiz.videoDetail.subtitles[i].default_mean_display=thiz.videoDetail.subtitles[i].default_mean.replace(/\.\./g," ")
                }
                if (thiz.videoDetail.description.length > thiz.limitDescription) {
                    thiz.showMoreDescription = true;
                } else {
                    thiz.showMoreDescription = false;
                }

                if(thiz.$refs.videoPlayer)  thiz.$refs.videoPlayer.resetSetting()
              
            })
            .catch( response => {
                this.$toastr('error', response.data.message);
                this.$router.push({ name: 'index' });
            })
        },
        initComments() {
            if(this.videoDetail.id){
                this.$http.get('comments/get-comments/' + this.videoDetail.id + '?page=' + this.current_page + '&per_page=10')
                .then( response => {
                    this.comments = response.data.comments;
                })
            }
        },
        initRecommend() {
            if(this.videoDetail.id){
                this.$http.get('videos/recommend?recommendLimit=20&idVideo=' + this.videoDetail.id + '&lang=' + this.$store.state.langStudy.raw_lang.code + '&langTrans=' + this.$store.state.langStudy.lang_trans.code)
                .then( response => {
                    this.videoRecommend = response.data.recommend;
                })
            }
        },
        initLanguages(data) {
            // localStorage.setItem('langAdvisorLanguages', this.globalEncodeData(data));
            // this.$store.commit('setLanguage', data);
        },
        initHistory() {
            if(this.user.history_status === 'active'){
                this.$http.get('videos/history/' + this.$route.params.slug);
            }
        },
        registerChannel() {
            this.$http.post(`channel/sub/${this.videoDetail.user.channel.id}`)
            .then((response) => {
                SocketService.emit('processSubcribe', { user_id: this.$store.state.user.data.id, id: this.videoDetail.user.channel.id });
            })
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
            if (this.current_page < this.comments.last_page) {
                this.current_page++
            }
        },
        gotoPage: function (page) {
            if (page != this.current_page && (page > 0 && page <= this.comments.last_page)) {
                this.current_page = page;
            }
        },
        sendComment() {
            this.$http.post('comments/sendcomment?idVideo=' + this.videoDetail.id, this.txtComment)
            .then( response => {
                this.$toastr('success', response.data.message);
                this.txtComment.content = '',
                this.initVideo();
            })
            .catch( response => {
                if(response.status == 400){
                    this.$toastr("error","Có lỗi trong quá trình xử lí dữ liệu");
                }else{
                    this.$toastr('error', response.data.message);
                    this.$router.push({ name: 'index' });
                }
            })
        },
        actionVideo(data){
            this.$http.post(`videos/action/${this.videoDetail.id}/?type=` + data)
            .then((response) => {
                SocketService.emit('processSubcribe', { user_id: this.$store.state.user.data.id, id: this.videoDetail.user.channel.id });
                if(data === 'watch_later' || data === 'remove_watch_later'){
                    SocketService.emit("processWatchLater", data);
                }
            })
            .catch((response) => {
                this.$toastr("error",response.data.message);
            });
        },
        showHideDescription() {
            this.showMoreDescription = !this.showMoreDescription;
        }
    },
    mounted() {
        this.initVideo();
        const socket = SocketService.socket;
        socket.on('updateSubcribe', (data) => {
            if(data.id == this.channel.id && this.$route.name == 'video-slug') {
                this.initVideo();
            }
        });
        socket.on('updateWatchLater', (data) => {
            if(data.id == this.videoDetail.id && this.$route.name == 'video-slug') {
                this.initVideo();
            }
        });
    },
    watch: {
        'current_page': function () {
            this.initVideo();
        },
        'txtComment.content': function() {
            if(this.txtComment.content != ''){
                this.btnComment = false;
            }else{
                this.btnComment = true;
            }
        }
    }
}
</script>