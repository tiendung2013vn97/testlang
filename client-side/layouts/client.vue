<template>
    <section class="container-fulid d-flex flex-column justify-content-start vh-min-100 gl-body bg-gray-3">
        <template v-if="!pageLoading">
            <Header @showSidebarPC="showSidebarPC"/>
            <div class="gl-content">
                <div class="mx-0 position-relative row">
                    <LeftAside ref="sidebar" />
                    <div class="px-0 col">
                        <nuxt />
                    </div>
                </div>
            </div>
            <Footer />
        </template>
    </section>
</template>
<script>
import Header from '~/components/client/base/Header';
import Footer from '~/components/client/base/Footer';
import LeftAside from '~/components/client/base/LeftAside';

export default {
    components: {
        Header,
        Footer,
        LeftAside,
    },
    data(){
        return {
            user: this.$store.state.user.data,
            isShowMenuResHeader: true,
        }
    },
    props: {
        pageLoading: '',
    },
    created() {
        this.$store.dispatch('user/authentication', { url: '', route: this.$route });
    },
    head() {
        return {
            link: [
                {
                    rel: 'stylesheet',
                    href: '/library-asset/css/bootstrap.min.css'
                },
                {
                    rel: 'stylesheet',
                    href: '/client-asset/css/main.css'
                },
                {
                    rel: 'stylesheet',
                    href: '/library-asset/css/toastr.min.css'
                },
                {
                    rel: 'stylesheet',
                    href: '/library-asset/css/slick.min.css'
                }
            ],
            script: [
                {
                    src: '/client-asset/js/script-min.js'
                },
                {
                    src: 'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js'
                },
                { src: '/dashboard-asset/global_assets/js/plugins/ckeditor/ckeditor.js' },
            ]
        }
    },
    mounted() {
        this.initLangStudy();
    },
    methods: {
        showSidebarPC: function() {
            this.$refs.sidebar.showMenuResHeader();
            this.isShowMenuResHeader = !this.isShowMenuResHeader;
        },
        initLangStudy() {
            let userSetting=localStorage.getItem('userSetting')
            // let langStudy = localStorage.getItem('langAdvisorLanguages');
            let langStudy=userSetting?JSON.parse(userSetting).langStudy:null
            let dataLangStudy = "";

            if(!localStorage.getItem("langAdvisorAccessToken")){
                if(!langStudy){
                    let langDefault = {
                        raw_lang:{"id":-1,"title":"Bất kì","code":"any","image":"","status":"active","description":""},
                        lang_trans:{"id":-1,"title":"Bất kì","code":"any","image":"","status":"active","description":""}
                    }
                    // localStorage.setItem('langAdvisorLanguages', this.globalEncodeData(langDefault));
                    this.$store.commit('setLanguage', langDefault);
                }else{
                    this.$store.commit('setLanguage', langStudy);
                }
                return
            }

            this.$http.get('user/settings')
            .then( response => {
                let raw_lang = response.data.value.langStudy.raw_lang;
                let lang_trans = response.data.value.langStudy.lang_trans;
                let langDefault = {
                    raw_lang,
                    lang_trans
                }
                // localStorage.setItem('langAdvisorLanguages', this.globalEncodeData(langDefault));
                this.$store.commit('setLanguage', langDefault);
            })
        }
    },
}
</script>