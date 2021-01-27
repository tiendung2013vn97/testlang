<template>
    <div v-if="!pageLoading">
        <nuxt />
    </div>
</template>
<script>
import AuthService from '~/services/auth.service';

export default {
    props: {
        pageLoading: '',
    },
    data() {
        return {    
            isAuth: AuthService.isAuth,
        }
    },
    created() {
        if(this.isAuth){
            this.$router.push({ name: 'index' });
        }
    },
    head() {
        return {
            link: [
                { rel: 'stylesheet', href: 'https://use.fontawesome.com/releases/v5.8.1/css/all.css' },
                { rel: 'stylesheet', href: '/library-asset/css/bootstrap.min.css' },
                { rel: 'stylesheet', href: '/client-asset/css/main.css' },
                { rel: 'stylesheet', href: '/library-asset/css/toastr.min.css' },
                { rel: 'stylesheet', href: '/dashboard-asset/assets/css/style.css' },
            ],
        }
    },
}
</script>
