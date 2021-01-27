<template>
    <div>
        <PageLoader :active.sync="pageLoading" :is-full-page="fullPage"/>
        <template v-if="$store.state.template == 'dashboard'">
            <Dashboard :pageLoading="pageLoading"/>
        </template>
        <template v-else-if="$store.state.template == 'login' || $store.state.template == 'register' || $store.state.template == 'forgot-pass'">
            <Auth :pageLoading="pageLoading"/>
        </template>
        <template v-else>
            <Client :pageLoading="pageLoading"/>
        </template>
    </div>
</template>
<script>
import AuthService from '~/services/auth.service';
import Dashboard from './dashboard';
import Client from './client';
import Auth from './auth';
import PageLoader from 'vue-loading-overlay';

export default {
    components: {
        Dashboard,
        Client,
        Auth,
        PageLoader,
    },
    head() {
        return {
            title: this.$store.state.seo.title,
            meta: [
                { hid: 'keywords', property: 'keywords', name: 'keywords', content: this.$store.state.seo.seo_keywords },
                { hid: 'description', property: 'description', name: 'description', content: this.$store.state.seo.seo_description },
                { hid: 'og:description', property: 'og:description', name: 'og:description', content: this.$store.state.seo.seo_description },
                { hid: 'og:title', property: 'og:title', name: 'og:title', content: this.$store.state.seo.title },
                { hid: 'og:image', property: 'og:image', name: 'og:image', content: this.$store.state.seo.seo_image },
            ]
        }
    },
    data() {
        return{
            userChange: false,
            pageLoading: true,
            fullPage: true,
        }
    },
    created() {
        this.loadPage();
    },
    methods: {
        loadPage: function() {
            this.pageLoading = true;
            let interval = setInterval(function() {
                if(!process.server && document.readyState === 'complete') {
                    clearInterval(interval);
                    setTimeout(function() {
                        this.pageLoading = false;
                    }.bind(this), 1000);
                }
            }.bind(this), 100);
        }
    },
    watch: {
        '$route.name': function() {
            this.loadPage();
        }
    },
    mounted() {
        window.addEventListener('click', function(event) {
            let elements = document.querySelectorAll('div.dropdown-menu');
            if(!event.target.classList.contains('showDrop')){
                elements.forEach(element => {
                    if(element.classList.contains('d-block')){
                        element.classList.add('d-none');
                        element.classList.remove('d-block');
                    }
                });
            }
        });
    },
    close () {
      // destroy the vue listeners, etc
      this.$destroy();

      // remove the element from the DOM
      this.$el.parentNode.removeChild(this.$el);
    }
}
</script>
<style>
    .vld-overlay {
        bottom: 0;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        align-items: center;
        display: none;
        justify-content: center;
        overflow: hidden;
        z-index: 1
    }

    .vld-overlay.is-active {
        display: flex
    }

    .vld-overlay.is-full-page {
        position: fixed
    }

    .vld-overlay .vld-background {
        bottom: 0;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        background: #fff;
        opacity: 1
    }

    .vld-overlay .vld-icon, .vld-parent {
        position: relative
    }
</style>

