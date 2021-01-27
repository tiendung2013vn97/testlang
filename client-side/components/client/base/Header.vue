<template>
    <div class="group-header">
        <nav id="idHeader" class="gl-header">
            <div id="header" class="gl-header__content">
                <div class="align-items-center d-flex mx-0 mx-lg-0 mx-md-4 py-2 row">
                    <div class="d-none d-lg-block px-3">
                        <i @click="showMenuResHeader" class="text-primary fas fa-bars cursor-pointer showDrop"></i>
                    </div>
                    <div class="d-none d-lg-block col-3">
                        <div class="form-search position-relative">
                            <input class="border-radius-10 py-2 w-100 font-14 border-0 pr-5" type="text" placeholder="Tìm kiếm" v-model="searchData" v-on:keyup.enter="searchVideo"/>
                            <i class="border-secondary position-absolute px-3 fas fa-search" @click="searchVideo"></i>
                            <!-- Search Suggestions -->
                            <div class="position-absolute top-100 w-100 left-0 transition-normal mt-2 bg-white box-shadow-normal overflow-auto"
                                id="search-suggestions" v-if="searchSuggestions">
                                <div class="position-relative w-100 bg-white bd-radius-4 box-shadow-normal overflow-auto h-100">
                                    <template v-if="videoRecommend.total > 0">
                                        <nuxt-link v-for="(video, index) in videoRecommend.data" :key="index" :to="{ name: 'video-slug', params: { slug: video.slug } }" class="d-flex text-body">
                                            <div  class="py-1 px-2 cursor-pointer transition-normal text-truncate" @click="closeSuggestion">
                                                {{ video.title }}
                                            </div>
                                        </nuxt-link>
                                    </template>
                                    <template v-else>
                                        <div class="py-1 px-2 cursor-pointer transition-normal text-truncate">
                                            Không tìm thấy kết quả nào
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="showDrop d-lg-none pl-3 search-mobile">
                        <i @click="globalShowDrop('searchMobile')" class="cursor-pointer showDrop text-white fas fa-search"></i>
                        <div id="searchMobile" class="d-none dropdown-menu form-search px-3 showDrop">
                            <input class="border-0 font-14 pr-5 py-2 showDrop w-100" type="text" placeholder="Tìm kiếm" v-model="searchData" v-on:keyup.enter="searchVideo"/>
                            <i class="border-secondary fa-search fas pl-4 position-absolute showDrop" @click="searchVideo"></i>
                            <!-- Search Suggestions -->
                            <div class="position-absolute top-100 w-100 left-0 transition-normal mt-2 bg-white box-shadow-normal overflow-auto"
                                id="search-suggestions" v-if="searchSuggestions">
                                <div class="position-relative w-100 bg-white bd-radius-4 box-shadow-normal overflow-auto h-100">
                                    <template v-if="videoRecommend.total > 0">
                                        <nuxt-link v-for="(video, index) in videoRecommend.data" :key="index" :to="{ name: 'video-slug', params: { slug: video.slug } }" class="d-flex text-body">
                                            <div  class="py-1 px-2 cursor-pointer transition-normal text-truncate" @click="closeSuggestion">
                                                {{ video.title }}
                                            </div>
                                        </nuxt-link>
                                    </template>
                                    <template v-else>
                                        <div class="py-1 px-2 cursor-pointer transition-normal text-truncate">
                                            Không tìm thấy kết quả nào
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col d-flex justify-content-center px-0">
                        <div class="logo">
                            <nuxt-link to="/">
                                <img :src="globalImageUrl('images-asset/logo.png')" class="d-none d-lg-block h-100 w-100" />
                                <img :src="globalImageUrl('images-asset/logo-sidebar.png')" class="d-lg-none h-100 w-100" />
                            </nuxt-link>
                        </div>
                    </div>
                    <div class="mx-2 position-relative right-10">

                        <div class="study-lang-dropdown-container">
                            <div class="position-relative cursor-pointer showDrop d-flex" @click="globalShowDrop('studyLang')">
                                <div class="title-language font-openSans font-weight-bold font-16 mr-2 showDrop">
                                    Học:
                                </div>
                                <div class="d-none d-lg-block font-openSans font-16 mr-3 showDrop" v-if="$store.state.langStudy && $store.state.langStudy.raw_lang.code">
                                    {{ $store.state.langStudy.raw_lang.title }}
                                </div>
                            </div>
                            <div id="studyLang" class="cursor-pointer d-none dropdown-menu language-drop p-0 position-absolute rounded-0">
                                <template v-for="(rawLang,index) in languages">
                                        <div :key="index" class="d-block text-center py-1 px-4 font-14 bg-light text-secondary rounded" :class="$store.state.langStudy.raw_lang.code == rawLang.code  ? 'text-main' : ''" @click="chooseLanguage({ raw_lang: rawLang, type: 'changeRawLang' })">
                                            {{ rawLang.title }} 
                                        </div>
                                </template>
                            </div>
                        </div>

                        <div class="trans-lang-dropdown-container">
                            <div class="position-relative cursor-pointer showDrop d-flex" @click="globalShowDrop('transLang')">
                                <div class="title-language font-openSans font-weight-bold font-16 mr-2 showDrop">
                                    Dịch:
                                </div>
                                <div class="d-none d-lg-block font-openSans font-16 mr-3 showDrop" v-if="$store.state.langStudy && $store.state.langStudy.lang_trans.code">
                                    {{ $store.state.langStudy.lang_trans.title }}
                                </div>
                            </div>
                            <div id="transLang" class="cursor-pointer d-none dropdown-menu language-drop p-0 position-absolute rounded-0">
                                <template v-for="(langTrans,index) in languages">
                                    <div :key="index" class="d-block text-center py-1 px-4 font-14 bg-light text-secondary rounded" :class="$store.state.langStudy.lang_trans.code == langTrans.code  ? 'text-main' : ''" @click="chooseLanguage({ lang_trans: langTrans, type: 'changeTransLang' })">
                                        {{ langTrans.title }} 
                                    </div>
                                </template>
                            </div>
                        </div>



                        <!-- <div class="position-relative cursor-pointer showDrop d-flex" @click="globalShowDrop('studyLang')">
                            <div class="title-language font-openSans font-weight-bold font-16 mr-2 showDrop">
                                Ngôn ngữ học:
                            </div>
                            <div class="d-none d-lg-block font-openSans font-16 mr-3 showDrop" v-if="$store.state.langStudy && $store.state.langStudy.raw_lang.code && $store.state.langStudy.lang_trans.code">
                                {{ $store.state.langStudy.raw_lang.title }} - {{ $store.state.langStudy.lang_trans.title }}
                            </div>
                        </div>
                        <div id="studyLang" class="cursor-pointer d-none dropdown-menu language-drop p-0 position-absolute rounded-0">
                            <template v-for="rawLang in languages">
                                <template v-for="langTrans in languages">
                                    <div class="d-block text-center py-1 px-4 font-14 bg-light text-secondary rounded" :class="$store.state.langStudy.raw_lang.code == rawLang.code && $store.state.langStudy.lang_trans.code == langTrans.code ? 'text-main' : ''" @click="chooseLanguage({ raw_lang: rawLang, lang_trans: langTrans })" v-if="rawLang != langTrans">
                                        {{ rawLang.title }} - {{ langTrans.title }}
                                    </div>
                                </template>
                            </template>
                        </div> -->
                    </div>
                    <div class="d-none d-lg-block font-openSans font-14 font-md-16" v-if="globalObjectLength($store.state.user.data)">
                        Số dư: {{ globalFormatNumber($store.state.user.data.balance, ',') + ' đ'}}
                    </div>
                    <div class="d-flex justify-content-end login mx-3 position-relative showDrop">
                        <div class="">
                            <div class="align-items-center d-flex text-decoration-none">
                                <template v-if="!globalObjectLength($store.state.user.data)">
                                    <nuxt-link to="/login">
                                        <span class="showDrop font-openSans font-weight-bold text-login font-16 pr-2">Đăng nhập</span>
                                    </nuxt-link>
                                </template>
                                <template v-else>
                                    <div @click="globalShowDrop('dropLogin1')" class="cursor-pointer showDrop avatar">
                                        <img :src="globalImageUrl( $store.state.user.data.avatar ? $store.state.user.data.avatar : 'images-asset/No_Image_Available.jpg')" class="showDrop h-100 w-100 rounded-circle"/>
                                    </div>
                                </template>
                            </div>
                        </div>
                        <div id="dropLogin1" class="d-none dropdown-menu px-2 right-0 showDrop" v-if="globalObjectLength($store.state.user.data)">
                            <nuxt-link class="dropdown-item font-13 px-1" :to="{ name: 'profile' }">
                                <i class="fas fa-user-circle mr-2"></i>Thông tin tài khoản
                            </nuxt-link>
                            <template v-if="channel">
                                <div class="cursor-pointer d-lg-none dropdown-item font-13 px-1" v-if="globalObjectLength($store.state.user.data)">
                                    <i class="fab fa-bitcoin mr-2"></i>Số dư: {{ globalFormatNumber($store.state.user.data.balance, ',') + ' đ'}}
                                </div>
                                <nuxt-link class="dropdown-item font-13 px-1" :to="{ name: 'channel-slug', params: { slug: channel.slug } }">
                                    <i class="fas fa-tv mr-2"></i>Kênh của tôi
                                </nuxt-link>
                                <nuxt-link class="dropdown-item font-13 px-1" :to="{ name: 'profile-video-upload' }">
                                    <i class="fas fa-upload mr-2"></i>Upload video
                                </nuxt-link>
                            </template>
                            <template v-else>
                                <nuxt-link class="dropdown-item font-13 px-1" :to="{ name: 'profile-channel-create' }">
                                    <i class="fas fa-tv mr-2"></i>Tạo channel
                                </nuxt-link>
                            </template>
                            
                            <nuxt-link class="dropdown-item font-13 px-1" :to="{ name: 'profile-recharge' }">
                                <i class="far fa-money-bill-alt mr-2"></i>Nạp tiền
                            </nuxt-link>
                            <nuxt-link class="dropdown-item font-13 px-1" :to="{ name: 'profile-withdrawal' }">
                                <i class="fas fa-university mr-2"></i>Rút tiền
                            </nuxt-link>
                            <nuxt-link class="dropdown-item font-13 px-1" :to="{ name: 'profile-pay-history' }">
                                <i class="fas fa-list-alt mr-2"></i>Lịch sử thanh toán
                            </nuxt-link>
                            <a href="#" class="dropdown-item font-13 px-1" @click="logOut()">
                                <i class="fas fa-sign-out mr-2"></i>Đăng xuất
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
        <nav class="gl-header-Mobile">
            <div class="img">
                <img :src="globalImageUrl('images-asset/bg-bottom.png')" class="h-100 position-relative w-100" />
                <div id="header" class="gl-header__content">
                    <div class="container gl-header__content__body">
                        <nuxt-link class="align-items-center d-flex flex-column justify-content-center" :class="$route.name == 'trending' ? 'text-main' : 'text-dark'" :to="{ name: 'trending' }">
                            <i class="far fa-fire-alt"></i>
                            <div class="font-10 font-md-12">Thịnh hành</div>
                        </nuxt-link>
                        <nuxt-link class="align-items-center d-flex flex-column justify-content-center" :class="$route.name == 'profile-subscriptions' ? 'text-main' : 'text-dark'" :to="{ name: 'profile-subscriptions' }">
                            <i class="fas fa-paper-plane"></i>
                            <div class="font-10 font-md-12">Đăng Ký</div>
                        </nuxt-link>
                        <nuxt-link class="menu-home align-items-center bg-primary d-flex flex-column justify-content-center p-3 rounded-circle" :class="$route.name == 'index' ? 'text-main' : 'text-white'" :to="{ name: 'index' }">
                            <i class="fas fa-home"></i>
                        </nuxt-link>
                        <nuxt-link class="align-items-center d-flex flex-column justify-content-center" :class="$route.name == 'profile-liked' ? 'text-main' : 'text-dark'" :to="{ name: 'profile-liked' }">
                            <i class="fas fa-thumbs-up"></i>
                            <div class="font-10 font-md-12">Đã thích</div>
                        </nuxt-link>
                        <nuxt-link class="align-items-center d-flex flex-column justify-content-center" :class="$route.name == 'profile-history' ? 'text-main' : 'text-dark'" :to="{ name: 'profile-history' }">
                            <i class="fal fa-history"></i>
                            <div class="font-10 font-md-12">Lịch sử</div>
                        </nuxt-link>
                    </div>
                </div>
            </div>
        </nav>
    </div>
</template>
<script>
    import AuthService from '~/services/auth.service';
    import SocketService from '~/services/socket.service';

    export default {
        conponents: {
            AuthService,
            SocketService,
        },
        data() {
            return {
                user: this.$store.state.user.data,
                channel: '',
                videoRecommend: '',
                limitVideoRecommend: 4,
                languages: [],               
                key: 0,
                searchData: this.$route.query.key_words && this.$route.name === 'search' ? this.$route.query.key_words : '',
                searchSuggestions: '',
                studyLangs:["Bất kì"],
                transLangs:["Bất kì"]
            }
        },
        created() {
            if(this.user.username){
                this.getChannel();
            }
            this.initLanguage();
        },
        methods: {
            logOut: function () {
                this.user = '';
                this.$router.go({
                    name: 'index',
                    force: true
                });
                AuthService.logOut();
                this.$store.commit('user/set', AuthService.setUser());
            },
            searchVideo: function() {
                this.$router.push({ 
                    name: 'search', 
                    query: { key_words: this.searchData, page: 1 },
                    force: true,
                });
                this.searchSuggestions = false;
                this.searchSuggestionsMobile = false;
                let filter = document.getElementById('filterConfig');
                if(filter && filter.classList.contains('show')){
                    document.getElementById('videosFilter').click();
                }
            },
            getChannel() {
                this.$http.get('channel/check-user-channel')
                .then((response) => {
                    this.channel = response.data.data;
                    if(this.channel && this.$route.name === 'profile-channel-create'){
                        this.$router.push({ name: 'channel-slug', params: { slug: this.channel.slug }});
                    }
                })
            },
            initLanguage() {
                this.$http.get('langs/all')
                .then(response => {
                    this.languages = [{"id":-1,"title":"Bất kì","code":"any","image":"","status":"active","description":""},
                    ...response.data.data];
                    
                    // let langTransCode= this.$store.state.langStudy.lang_trans.code
                    // let langRawCode= this.$store.state.langStudy.raw_lang.code
                    // this.studyLangs= this.languages.filter(lang=>lang.code!=langTransCode)
                    // this.transLangs= this.languages.filter(lang=>lang.code!=langRawCode)
                })
            },
            chooseLanguage(data) {
                let langStudy={
                    raw_lang: this.$store.state.langStudy.raw_lang,
                    lang_trans: this.$store.state.langStudy.lang_trans
                }
                
                if(data.type=="changeRawLang"){
                    langStudy.raw_lang= data.raw_lang
                }
                if(data.type=="changeTransLang"){
                    langStudy.lang_trans= data.lang_trans
                }
                // localStorage.setItem('langAdvisorLanguages', this.globalEncodeData(langStudy));
                this.$store.commit('setLanguage', langStudy);
                this.$router.push({ name: "index" });
            },
            showMenuResHeader: function() {
                this.$emit('showSidebarPC');
            },
            closeSuggestion: function() {
                this.searchData = '';
                this.searchSuggestions = false;
                this.searchSuggestionsMobile = false;
            },
        },
        watch: {
            'searchData': function() {
                if(this.searchData) {
                    this.$http.get('videos/search?key_words=' + this.searchData + '&per_page=' + this.limitVideoRecommend)
                    .then(response => {
                        this.videoRecommend = response.data.data;
                        this.searchSuggestions = true;
                        this.searchSuggestionsMobile = true;
                    })
                }else {
                    this.searchSuggestions = false;
                    this.searchSuggestionsMobile = false;
                }
            },
        },
        mounted() {
            const socket = SocketService.socket;
            socket.on("updateUserLogin", (data) => {
                if(this.user.id == data.user_id){
                    AuthService.setAccessToken(data.token);
                    this.$store.commit('user/set', AuthService.setUser());
                    if(this.$store.state.user.data.status == 'banned'){
                        this.logOut();
                    }
                }
            });

        }
    }
</script>
