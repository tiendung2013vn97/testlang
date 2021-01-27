<template>
    <div v-if="$store.state.user.data.account_type == 'ADMIN' && !pageLoading">
        <body class="" cz-shortcut-listen="true" v-if="isAuth">

            <!-- Main navbar -->
            <Header />
            <!-- /main navbar -->


            <!-- Page content -->
            <div class="page-content">

                <!-- Main sidebar -->
                <div class="sidebar sidebar-light sidebar-expand-md toggled" id="sidebar-wrapper">

                    <!-- Sidebar mobile toggler -->
                    <div class="sidebar-mobile-toggler text-center">
                        <a href="#" class="sidebar-mobile-main-toggle">
                            <i class="icon-arrow-left8"></i>
                        </a>
                        <span class="font-weight-semibold">Navigation</span>
                        <a href="#" class="sidebar-mobile-expand">
                            <i class="icon-screen-full"></i>
                            <i class="icon-screen-normal"></i>
                        </a>
                    </div>
                    <!-- /sidebar mobile toggler -->


                    <!-- Sidebar content -->
                    <div class="sidebar-content">

                        <!-- User menu -->
                        <div class="sidebar-user-material">
                            <div class="sidebar-user-material-body">
                                <div class="card-body text-center">
                                    <a href="#">
                                        <img src="/dashboard-asset/global_assets/images/demo/users/face22.jpg" class="img-fluid rounded-circle shadow-1 mb-3" width="80" height="80">
                                    </a>
                                    <h6 class="mb-0 text-white text-shadow-dark">{{ $store.state.user.data.username }}</h6>
                                </div>

                                <div class="sidebar-user-material-footer">
                                    <a href="#user-nav" class="d-flex justify-content-between align-items-center text-shadow-dark dropdown-toggle legitRipple" data-toggle="collapse"><span>My account</span></a>
                                </div>
                            </div>

                            <div class="collapse" id="user-nav">
                                <ul class="nav nav-sidebar">
                                    <li class="nav-item">
                                        <a href="#" class="nav-link legitRipple">
                                            <i class="mdi mdi-information"></i>
                                            <span>My profile</span>
                                        </a>
                                    </li>
                                    <li class="nav-item">
                                        <a href="#" class="nav-link legitRipple">
                                            <i class="mdi mdi-message"></i>
                                            <span>Messages</span>
                                            <span class="badge bg-teal-400 badge-pill align-self-center ml-auto">58</span>
                                        </a>
                                    </li>
                                    <li class="nav-item">
                                        <a href="#" class="nav-link legitRipple" @click="logOut()">
                                            <i class="mdi mdi-power"></i>
                                            <span>Logout</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <!-- /user menu -->

                        <Sidebar />

                    </div>
                    <!-- /sidebar content -->
                    
                </div>
                <!-- /main sidebar -->


                <!-- Main content -->
                <div class="content-wrapper">
                    <!-- Page header -->
                    <div class="page-header page-header-light">
                        <div class="page-header-content header-elements-md-inline">
                            <div class="page-title d-flex">
                                <h4><i class="icon-arrow-left52 mr-2"></i> <span class="font-weight-semibold">Home</span> - Dashboard</h4>
                                <a href="#" class="header-elements-toggle text-default d-md-none"><i class="icon-more"></i></a>
                            </div>
                        </div>

                        <div class="breadcrumb-line breadcrumb-line-light header-elements-md-inline">
                            <div class="d-flex">
                                <div class="breadcrumb">
                                    <a href="index.html" class="breadcrumb-item"><i class="icon-home2 mr-2"></i> Home</a>
                                    <span class="breadcrumb-item active">Dashboard</span>
                                </div>

                                <a href="#" class="header-elements-toggle text-default d-md-none"><i class="icon-more"></i></a>
                            </div>
                        </div>
                    </div>
                    <!-- /page header -->
                    <!-- Cntent area -->   
                    <div class="content">
                        <nuxt />
                    </div>
                    <!-- /content area -->           
                </div>
                <!-- /main content -->

            </div>
            <!-- /page content -->
            <Footer />
        </body>

    </div>
</template>
<script>
import Header from '~/components/dashboard/Header';
import Sidebar from '~/components/dashboard/Sidebar';
import Footer from '~/components/dashboard/Footer';
import AuthService from '~/services/auth.service';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

export default {
    components: {
        Header,
        Sidebar,
        Footer,
        PulseLoader
    },
    props: {
        pageLoading: '',
    },
    head() {
        return {
            link: [
                { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:400,300,100,500,700,900' },
                { rel: 'stylesheet', href: '/dashboard-asset/assets/css/materialdesignicons.min.css' },
                { rel: 'stylesheet', href: '/dashboard-asset/assets/css/bootstrap_limitless.min.css' },
                { rel: 'stylesheet', href: '/library-asset/css/toastr.min.css' },
                { rel: 'stylesheet', href: '/dashboard-asset/assets/css/components.min.css' },
                { rel: 'stylesheet', href: '/dashboard-asset/assets/css/colors.min.css' },
                { rel: 'stylesheet', href: '/dashboard-asset/assets/css/layout.min.css' },
            ],
            script: [
                { src: '/dashboard-asset/global_assets/js/main/jquery.min.js' },
                { src: '/dashboard-asset/global_assets/js/main/bootstrap.bundle.min.js' },
                { src: '/dashboard-asset/global_assets/js/plugins/loaders/blockui.min.js' },
                { src: '/dashboard-asset/global_assets/js/plugins/ui/ripple.min.js' },
                { src: '/dashboard-asset/global_assets/js/plugins/ckeditor/ckeditor.js' },
                { src: '/dashboard-asset/assets/js/app.js' },
            ]
        }
    },
    created() {
        this.$store.dispatch('user/authentication', { url: '', route: this.$route });
        if(this.isAuth){
            setTimeout( function(){
                this.isLoaded = true;
            }.bind(this), 500);
        }
    },
    data() {
        return {
            isAuth: AuthService.isAuth,
            isLoaded: !AuthService.isAuth ? true : false,
        }
    },
    methods: {
        logOut: function(){
            AuthService.logOut();
            this.$store.commit('user/set', AuthService.setUser());
            this.$router.go({
                name: 'index',
                force: true
            });
        },
    },
}
</script>
