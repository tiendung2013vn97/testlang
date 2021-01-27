<template>
    <div>
        <template v-if="isLoad">
            <div class="col-12 grid-margins tretch-card">
                <div class="text-center mt-3">
                    <PulseLoader :color="'#da8cff'" :size="'20px'"/>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="col-12 grid-margin stretch-card" v-if="pages">
                <PageForm :pages="pages"/>
            </div>
        </template>
    </div>
</template>
<script>
import PageForm from '~/components/dashboard/form/Page.vue';
import SocketService from '~/services/socket.service';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

export default {
    components:{
        PageForm,
        PulseLoader
    },
    data() {
        return {
            pages: '',
            isLoad: true,
        }
    },
    created() {
        this.$store.commit('setActiveSidebar', { isActive: 'pages' });
        this.initNew();
    },
    methods: {
        initNew: function() {
            this.isLoad = true;
            this.$http.get('pages/update/' + this.$route.params.id)
            .then( response => {
                this.pages = response.data.data;
                this.pages.seo_imageStr = '';
                this.isLoad = false;
            })
            .catch( response => {
                this.pages = '';
                this.isLoad = false;
                if(response.status == 400){
                    this.$toastr("error","Có lỗi trong quá trình xử lí dữ liệu");
                }else{
                    this.$toastr('error', response.data.message);
                    this.$router.push({ name: 'dashboard-pages', query: { page: this.$route.query.return } });
                }
            })
        }
    },
    mounted(){
    }
}
</script>