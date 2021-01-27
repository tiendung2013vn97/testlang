<template>
    <div class="left-aside" :class="toggleSidebar == 'active' ? (isShowMenuResHeader ? 'col-2' : 'col-1') : (isShowMenuResHeader ? 'd-none' : 'col-2')">
        <div class="gl-sidebar px-0" :class="(toggleSidebar == 'active' ? (isShowMenuResHeader ? 'col-2' : 'col-1') : (isShowMenuResHeader ? 'd-none' : 'col-2'))">
            <div class="gl-sidebar__content">
                <div>
                    <div class="d-flex justify-content-center my-3">
                        <div class="logo">
                            <nuxt-link to="/">
                                <img :src="globalImageUrl('images-asset/logo-sidebar.png')" class="h-100 w-100" />
                            </nuxt-link>
                        </div>
                    </div> 
                    <ul class="pl-0 list-style-none">
                        <li class="py-2" :class="$route.name == 'index' ? 'active-sidebar' : ''">
                            <nuxt-link :to="{ name: 'index'}" :class="(toggleSidebar == 'active' ? (isShowMenuResHeader ? 'pl-3' : 'flex-column') : (isShowMenuResHeader ? 'flex-column' : 'pl-3'))" class="text-toggle-sidebar">
                                <i :class="toggleSidebar == 'active' ? (isShowMenuResHeader ? 'mr-2' : 'mb-1') : (isShowMenuResHeader ? 'mb-1' : 'mr-2')" class="fas fa-home"></i><div class="text-truncate pr-2">Trang chủ</div>
                            </nuxt-link>
                        </li>
                       
                        <li class="py-2" :class="$route.name == 'trending' ? 'active-sidebar' : ''">
                            <nuxt-link :to="{ name: 'trending' }" :class="(toggleSidebar == 'active' ? (isShowMenuResHeader ? 'pl-3' : 'flex-column') : (isShowMenuResHeader ? 'flex-column' : 'pl-3'))" class="text-toggle-sidebar">
                                <i :class="toggleSidebar == 'active' ? (isShowMenuResHeader ? 'mr-2' : 'mb-1') : (isShowMenuResHeader ? 'mb-1' : 'mr-2')" class="far fa-fire-alt"></i><div class="text-truncate pr-2">Thịnh hành</div>
                            </nuxt-link>
                        </li>
                        <li class="py-2" :class="$route.name == 'profile-subscriptions' ? 'active-sidebar' : ''">
                            <nuxt-link :to="{ name: 'profile-subscriptions' }" :class="(toggleSidebar == 'active' ? (isShowMenuResHeader ? 'pl-3' : 'flex-column') : (isShowMenuResHeader ? 'flex-column' : 'pl-3'))" class="text-toggle-sidebar">
                                <i :class="toggleSidebar == 'active' ? (isShowMenuResHeader ? 'mr-2' : 'mb-1') : (isShowMenuResHeader ? 'mb-1' : 'mr-2')" class="fas fa-paper-plane"></i><div class="text-truncate pr-2">Kênh đăng ký</div>
                            </nuxt-link>
                        </li>
                        <hr :class="isShowMenuResHeader ? 'bg-white mx-2' : 'd-none'" />
                        <li class="py-2" :class="$route.name == 'profile-history' ? 'active-sidebar' : ''">
                            <nuxt-link :to="{ name: 'profile-history' }" :class="(toggleSidebar == 'active' ? (isShowMenuResHeader ? 'pl-3' : 'flex-column') : (isShowMenuResHeader ? 'flex-column' : 'pl-3'))" class="text-toggle-sidebar">
                                <i :class="toggleSidebar == 'active' ? (isShowMenuResHeader ? 'mr-2' : 'mb-1') : (isShowMenuResHeader ? 'mb-1' : 'mr-2')" class="fal fa-history"></i><div class="text-truncate pr-2">Lịch sử</div>
                            </nuxt-link>
                        </li>
                        <li class="py-2" :class="$route.name == 'profile-playlist' ? 'active-sidebar' : ''">
                            <nuxt-link :to="{ name: 'profile-playlist' }" :class="(toggleSidebar == 'active' ? (isShowMenuResHeader ? 'pl-3' : 'flex-column') : (isShowMenuResHeader ? 'flex-column' : 'pl-3'))" class="text-toggle-sidebar">
                                <i :class="toggleSidebar == 'active' ? (isShowMenuResHeader ? 'mr-2' : 'mb-1') : (isShowMenuResHeader ? 'mb-1' : 'mr-2')" class="fas fa-clock"></i><div class="text-truncate pr-2">Xem sau</div>
                            </nuxt-link>
                        </li>
                        <li class="py-2" :class="$route.name == 'profile-liked' ? 'active-sidebar' : ''">
                            <nuxt-link :to="{ name: 'profile-liked' }" :class="(toggleSidebar == 'active' ? (isShowMenuResHeader ? 'pl-3' : 'flex-column') : (isShowMenuResHeader ? 'flex-column' : 'pl-3'))" class="text-toggle-sidebar">
                                <i :class="toggleSidebar == 'active' ? (isShowMenuResHeader ? 'mr-2' : 'mb-1') : (isShowMenuResHeader ? 'mb-1' : 'mr-2')" class="fas fa-thumbs-up"></i><div class="text-truncate pr-2">Video đã thích</div>
                            </nuxt-link>
                        </li>
                    </ul>
                    <div :class="toggleSidebar == 'active' ? (isShowMenuResHeader ? 'd-block' : 'd-none') : (isShowMenuResHeader ? 'd-none' : 'd-block')">
                        <hr :class="toggleSidebar == 'active' ? (isShowMenuResHeader ? 'bg-white mx-2' : 'd-none') : (isShowMenuResHeader ? 'd-none' : 'bg-white mx-2')" />
                        <ul class="pl-0 list-style-none">
                            <div class="font-weight-bold font-18 pl-3 text-white">Thể loại</div>
                            <template v-if="limitCategory > categories.length">
                                <template v-for="(category, index) in categories">
                                    <li class="pl-3 py-2" :class="{'active-sidebar': isSearch(category.id)}" :key="index">
                                        <nuxt-link :to="{ name: 'search', query: { category: category[i - 1].id } }" :key="index" class="text-toggle-sidebar">
                                            <div class="d-flex img-icon mr-1">
                                                <img :src="globalImageUrl(categories[i - 1].icon ? categories[i - 1].icon : 'images-asset/No_Image_Available.jpg')" class="h-100 rounded-circle w-100" />
                                            </div>
                                            <div class="text-truncate pr-2 ">{{ categories[i - 1].title }}</div>
                                        </nuxt-link>
                                    </li>
                                </template>
                            </template>
                            <template v-else>
                                <template v-for="(category, pIndex) in categories">
                                    <template v-if="pIndex < limitCategoryDefault">
                                        <li :key="pIndex" class="pl-3 py-2" :class="{'active-sidebar': isSearch(category.id)}">
                                            <nuxt-link :to="{ name: 'search', query: { category: category.id } }" :class="$route.name == 'search' && $route.query.category == category.id ? 'text-main' : ''" class="text-toggle-sidebar">
                                                <div class="d-flex img-icon mr-1">
                                                    <img :src="globalImageUrl(category.icon ? category.icon : 'images-asset/No_Image_Available.jpg')" class="h-100 rounded-circle w-100" />
                                                </div>
                                                <div class="text-truncate pr-2 ">{{ category.title }}</div>
                                            </nuxt-link>
                                        </li>
                                    </template>
                                    <template v-else>
                                        <div :key="pIndex" id="showMoreID" class="d-none">
                                            <ul class="list-style-none pl-0">
                                                <li class="pl-3 py-2" :class="{'active-sidebar': isSearch(category.id)}" :style="{padding: bindingPadding(index < limitCategoryDefault)}" v-for="(category, index) in categories" :key="index">
                                                    <nuxt-link v-if="index >= limitCategoryDefault" :to="{ name: 'search', query: { category: category.id } }" :class="$route.name == 'search' && $route.query.category == category.id ? 'text-main' : ''" class="text-toggle-sidebar">
                                                        <div class="d-flex img-icon mr-1">
                                                            <img :src="globalImageUrl(category.icon ? category.icon : 'images-asset/No_Image_Available.jpg')" class="h-100 rounded-circle w-100" />
                                                        </div>
                                                        <div class="text-truncate pr-2 ">{{ category.title }}</div>
                                                    </nuxt-link>
                                                </li>
                                            </ul>
                                        </div>
                                    </template>
                                </template>
                                <div @click="globalShowDrop('showMoreID')" class="mx-3 text-center p-lg-1">
                                    <button class="btn-block btnShowMore font-10" @click="showMoreCategory">{{ isSeeMoreCategory ? 'RÚT GỌN' : 'XEM THÊM ' + (categories.length - limitCategory) + ' MỤC' }}</button>
                                </div>
                            </template>
                        </ul>
                        <template v-if="globalObjectLength(user) && channelSub.length">
                            <hr class="bg-white mx-2">
                            <ul class="pl-0 list-style-none">
                                <div class="font-weight-bold pl-3 text-white">Kênh đăng ký</div>
                                <template v-if="limitChannel > channelSub.length">
                                    <template v-for="(channel, index) in channelSub">
                                        <li class="pl-3 py-2" :class="{'active-sidebar': isChangeSlug(channel.slug)}" :key="index">
                                            <nuxt-link :to="{ name: 'channel-slug', params: { slug: channel.slug } }" class="text-toggle-sidebar">
                                                <div class="d-flex img-icon mr-1">
                                                    <img :src="globalImageUrl(channel.avatar ? channel.avatar : 'images-asset/No_Image_Available.jpg')" class="h-100 rounded-circle w-100" />
                                                </div>
                                                <div class="text-truncate pr-2 ">{{ channel.title }}</div>
                                            </nuxt-link>
                                        </li>
                                    </template>
                                </template>
                                <template v-else>
                                    <template v-for="(channel, pIndex) in limitChannel">
                                        <template v-if="pIndex < limitChannelDefault">
                                            <li :key="pIndex" class="pl-3 py-2" :class="{'active-sidebar': isChangeSlug(channel.slug)}">
                                                <nuxt-link :to="{ name: 'channel-slug', params: { slug: channel.slug } }" :class="$route.name == 'channel-slug' && channel.slug == $route.params.slug ? 'text-main' : ''" class="text-toggle-sidebar">
                                                    <div class="d-flex img-icon mr-1">
                                                        <img :src="globalImageUrl(channel.avatar ? channel.avatar : 'images-asset/No_Image_Available.jpg')" class="h-100 rounded-circle w-100" />
                                                    </div>
                                                    <div class="text-truncate pr-2 ">{{ channel.title }}</div>
                                                </nuxt-link>
                                            </li>
                                        </template>
                                        <template v-else>
                                            <div :key="pIndex" id="showMoreChannel" class="d-none">
                                                <ul class="list-style-none pl-0">
                                                    <li class="pl-3 py-2" :class="{'active-sidebar': isChangeSlug(channel.slug)}" :style="{padding: bindingPadding(index < limitChannelDefault)}" v-for="(channel, index) in channelSub" :key="index">
                                                        <nuxt-link v-if="index >= limitChannelDefault" :to="{ name: 'channel-slug', params: { slug: channel.slug } }" :class="$route.name == 'channel-slug' && channel.slug == $route.params.slug ? 'text-main' : ''" class="text-toggle-sidebar">
                                                            <div class="d-flex img-icon mr-1">
                                                                <img :src="globalImageUrl(channel.avatar ? channel.avatar : 'images-asset/No_Image_Available.jpg')" class="h-100 rounded-circle w-100" />
                                                            </div>
                                                            <div class="text-truncate pr-2 ">{{ channel.title }}</div>
                                                        </nuxt-link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </template>
                                    </template>
                                    <div @click="globalShowDrop('showMoreChannel')" class="mx-3 text-center p-lg-1">
                                        <button class="btn-block btnShowMore" @click="showMoreSubcribe">{{ isSeeMoreSubscribe ? 'RÚT GỌN' : 'XEM THÊM ' + (channelSub.length - limitChannel) + ' MỤC' }}</button>
                                    </div>
                                </template>
                            </ul>
                        </template>
                        <template v-if="globalObjectLength(user)">
                            <hr class="bg-white mx-2">
                            <ul class="pl-0 list-style-none">
                                <li class="pl-3 py-2" :class="$route.name == 'profile' ? 'active-sidebar' : ''">
                                    <nuxt-link :to="{ name: 'profile' }" class="text-toggle-sidebar">
                                        <div class="d-flex img-icon mr-1">
                                            <i class="fas fa-cog"></i>
                                        </div>
                                        <div class="text-truncate pr-2">Cài đặt</div>
                                    </nuxt-link>
                                </li>
                            </ul>
                            <hr class="bg-white mx-2">
                        </template>
                        <div class="d-flex flex-wrap pl-4" v-if="posts">
                            <template v-for="(page, pageIndex) in posts">
                                <nuxt-link :key="pageIndex" :to="{name: 'page-slug', params: {slug: page.slug} }" class="mr-3 text-white">{{ page.title }}</nuxt-link>
                            </template>
                        </div>
                        <div class="mx-3 mb-3 text-white font-15 font-openSans">© 2019 Langadvisor</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
import SocketService from '~/services/socket.service';
export default {
    data() {
        return {
            isShowMenuResHeader: true,
            toggleSidebar: '',
            isSeeMoreSubscribe: false,
            isSeeMoreCategory: false,
            categories: '',
            channelSub: '',
            user: this.$store.state.user.data,
            limitCategory: 5,
            limitChannel: 5,
            limitCategoryDefault: 5,
            limitChannelDefault: 5,
            settings: '',
            posts: '',
        };
    },
    created() {
        this.initMenu();
        this.initCategory();
        this.initChannel();
        this.initSettings();
    },
    computed: {
    },
    methods: {
        isSearch(id) {
            if (this.$router.name === 'search' && this.$route.query.category === id) {
                return true
            }
            return false
        },
        isChangeSlug(slug) {
            if (this.$route.name == 'channel-slug' && this.$route.params.slug == slug) return true
            return false
        },
        bindingPadding(isTrue) {
            if (isTrue) return '0 !important'
        },
        showMenuResHeader: function() {
            this.isShowMenuResHeader = !this.isShowMenuResHeader;
        },
        initMenu: function() {
            if(this.$route.name == "index") {
                this.toggleSidebar = "active";
            }
        },
        showMoreSubcribe() {
            this.isSeeMoreSubscribe = !this.isSeeMoreSubscribe;
            if(this.isSeeMoreSubscribe) {
                this.limitChannel = this.channelSub.length;
            }else {
                this.limitChannel = 5;
            }
        },
        showMoreCategory() {
            this.isSeeMoreCategory = !this.isSeeMoreCategory;
            if(this.isSeeMoreCategory) {
                this.limitCategory = this.categories.length;
            }else {
                this.limitCategory = 5;
            }
        },
        initCategory(){
            this.$http.get(`categories/all`)
            .then((response) => {
                this.categories = response.data.data;
            })
        },
        initChannel(){
            if(this.user.username){
                this.$http.get(`channel/get-channel-sub`)
                .then((response) => {
                    this.channelSub = response.data.channel;
                })
            }
        },
        initSettings: function () {
            this.$http.get('settings?type=sidebar')
            .then(response => {
                this.settings = response.data.data;
                this.posts = this.settings.sidebar_area_1.posts;
            })
        },
    },
    mounted() {
        const socket = SocketService.socket;
        socket.on('updateSubcribe', (data) => {
            if(data.user_id == this.$store.state.user.data.id) {
                this.initChannel();
            }
        });
    },
};
</script>