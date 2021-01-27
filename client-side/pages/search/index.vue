<template>
    <div class="gl-container transition-normal gl-wrap--padding-left">
        <div class="container">
            <div class="row">
                <div class="col-12 mt-3">
                    <div class="group-search-result">
                        <!-- filter result -->
                        <div class="border-bottom pb-2 pt-2">
                            <div class="d-flex align-items-center cursor-pointer mb-2" data-toggle="collapse" id="videosFilter"
                                data-target="#filterConfig" aria-expanded="false" aria-controls="filterConfig">
                                <i class="far fa-sliders-h mr-2"></i>
                                <span class="font-weight-500">Filter</span>
                            </div>
                            <div id="filterConfig" class="collapse my-2">
                                <div class="d-grid search-filter-group">
                                    <div class v-if="categories">
                                        <div class="font-weight-500 font-12 font-md-16 text-uppercase border-bottom pb-2 mb-2 text-nowrap">Loại</div>
                                        <template v-for="category in categories">
                                            <button class="bg-transparent border-0 p-0 d-block my-1 font-10 font-md-14 text-left " :class="$route.query.category == category.id ? 'font-weight-bold' : ''"><nuxt-link class="text-dark font-15" :to="{ name: 'search', query: {...$route.query, ...{ category: category.id }} }">{{ category.title }}</nuxt-link></button>
                                        </template>
                                    </div>
                                    <div class>
                                        <div class="font-weight-500 font-12 font-md-16 text-uppercase border-bottom pb-2 mb-2 text-nowrap">Sắp xếp theo</div>
                                        <button class="bg-transparent border-0 p-0 d-block my-1 font-10 font-md-14 text-left" :class="$route.query.order_by == 'date' ||  $route.query.order_by != 'like' && $route.query.order_by != 'view' ? 'font-weight-bold' : ''" @click="orderByVideo('date')">Ngày tải lên</button>
                                        <button class="bg-transparent border-0 p-0 d-block my-1 font-10 font-md-14 text-left" :class="$route.query.order_by == 'like' ? 'font-weight-bold' : ''" @click="orderByVideo('like')">Like</button>
                                        <button class="bg-transparent border-0 p-0 d-block my-1 font-10 font-md-14 text-left" :class="$route.query.order_by == 'view' ? 'font-weight-bold' : ''" @click="orderByVideo('view')">Lượt xem</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <template v-if="isLoad">
                            <!-- List results -->
                            <template v-if="videos.data && videos.data.length > 0">
                                <div class="pb-2 search-results__list-results">
                                    <template v-for="(video, index) in videos.data">
                                        <div class="my-3 d-sm-flex w-100 text-dark" :key="index">
                                            <nuxt-link :to="{ name: 'video-slug', params: { slug: video.slug } }">
                                                <div class="position-relative search-result__img-preview mr-sm-3">
                                                    <img :src="globalImageUrl(video.image ? video.image : 'images-asset/No_Image_Available.jpg')"
                                                        class="image d-block mr-md-3 w-100" />
                                                    <div
                                                        class="position-absolute top-0 left-0 w-100 h-100 d-flex align-items-center justify-content-center video__icon-play-on-hover text-secondary opacity-0 transition-normal bg-dark-alpha">
                                                        <i class="fas fa-play font-30"></i>
                                                    </div>
                                                    <div class="font-11 bg-opacity position-absolute bottom-0 right-0 font-10 p-1 rounded my-1 mx-2 text-light">
                                                        {{ globalCalculateVideoTime(video.duration) }}
                                                    </div>
                                                </div>
                                            </nuxt-link>
                                            <div class="search-results__info-video mt-2 mt-sm-0">
                                                <nuxt-link :to="{ name: 'video-slug', params: { slug: video.slug } }">
                                                    <div class="mr-md-5 font-12 font-md-16 text-body">
                                                        {{ video.title }}
                                                    </div>
                                                </nuxt-link>
                                                <div class="d-flex align-items-center font-10 font-md-14 mt-1 text-secondary">
                                                    <nuxt-link :to="{ name: 'channel-slug', params: { slug: video.user.channel.slug } }"><button class="bg-transparent p-0 border-0 text-dark">{{ video.user.channel ? video.user.channel.title : '' }}</button></nuxt-link>
                                                    <div class="font-10 font-md-14 ml-1">&middot; {{ globalFormatNumber("" + video.view,".") }} lượt xem &middot; {{globalFormatDate(video.createdAt)}}</div>
                                                </div>
                                                <div class="mt-1 text-secondary font-8 font-md-14 gl-refont d-none d-md-block" v-html="globalLimitDescription(video.description, 150)"></div>
                                            </div>
                                        </div>
                                    </template>
                                    <Pagination :tablePagination="videos" :paramsPage="$route.query.page" @changePage="changePage" />
                                </div>
                            </template>
                            <template v-else>
                                <div class="pb-2 search-results__list-results text-center mt-2">
                                    Không tìm thấy kết quả nào
                                </div>
                                <div class="pb-2 search-results__list-results text-center mt-2">
                                    Nhập từ khoá vào ô tìm kiếm bên trên !
                                </div>
                            </template>
                        </template>
                        <template v-else>
                            <div class="pb-2 search-results__list-results text-center mt-2">
                                <PulseLoader :color="'#da8cff'"/>
                            </div>
                        </template>
                    </div>
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
            videos: '',
            noResult: false,
            isLoad: false,
            categories: '',
            langStudy: this.$store.state.langStudy,
        };
    },
    created() {
        this.initUrl();
        this.initCategory();
    },
    methods: {
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
            if (this.$route.query.page > 1) {
                this.$router.push({
                    query: Object.assign({}, this.$route.query, {
                        page: this.$route.query.page - 1,
                    })
                });
            }
        },
        gotoNextPage: function () {
            if (this.$route.query.page < this.videos.last_page) {
                this.$router.push({
                    query: Object.assign({}, this.$route.query, {
                        page: this.$route.query.page + 1,
                    })
                });
            }
        },
        gotoPage: function (page) {
            if (page != this.$route.query.page && (page > 0 && page <= this.videos.last_page)) {
                this.$router.push({
                    query: Object.assign({}, this.$route.query, {
                        page: page
                    })
                });
            }
        },
        initUrl: function () {
            this.videos = '';
            if (this.globalObjectLength(this.$route.query)) {
                let url = `videos/search`;
                let i = 0;
                for (let key in this.$route.query) {
                    if (key != 'per_page') {
                        let query = this.$route.query[key];
                        if (i == 0) {
                            url = `${url}?${key}=${query}`;
                        } else {
                            url = `${url}&${key}=${query}`;
                        }
                        i++;
                    }
                }
                this.apiUrl = url + '&per_page=20&lang=' + this.langStudy.raw_lang.code + '&langTrans=' + this.langStudy.lang_trans.code;
            } else {
                this.$router.push({
                    query: {
                        page: 1
                    }
                });
                this.apiUrl = `videos/search?page=1&per_page=20&lang=` + this.langStudy.raw_lang.code + '&langTrans=' + this.langStudy.lang_trans.code;
            }
            this.initVideo();
        },
        initVideo: function () {
            this.isLoad = false;
            this.$http.get(this.apiUrl)
            .then(response => {
                this.videos = response.data.data;
                this.isLoad = true;
            })
            .catch( response => {
                this.isLoad = true;
            })
        },
        initCategory(){
            this.$http.get(`categories/all`)
            .then((response) => {
                this.categories = response.data.data;
            })
        },
        orderByVideo: function(order_by) {
            this.$router.push({ name: 'search', query: { ...this.$route.query, ...{ order_by } } });
        },
    },
    watch: {
        '$route.query': function () {
            this.initUrl();
        }
    }
}
</script>