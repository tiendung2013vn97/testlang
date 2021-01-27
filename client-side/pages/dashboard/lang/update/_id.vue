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
            <div class="col-12 grid-margin stretch-card" v-if="langs">
                <LangForm :langs="langs"/>
            </div>
        </template>
    </div>
</template>
<script>
import LangForm from '~/components/dashboard/form/Lang.vue';
import SocketService from '~/services/socket.service';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

export default {
    components:{
        LangForm,
        PulseLoader
    },
    data() {
        return {
            langs: '',
            isLoad: true,
        }
    },
    created() {
        this.$store.commit('setActiveSidebar', { isActive: 'langs' });
        this.initLang();
    },
    methods: {
        initLang: function() {
            this.isLoad = true;
            this.$http.get('langs/update/' + this.$route.params.id)
            .then( response => {
                this.langs = response.data.lang;
                this.langs.imageStr = '';
                this.isLoad = false;
            })
            .catch( response => {
                this.langs = '';
                this.isLoad = false;
                if(response.status == 400){
                    this.$toastr("error","Có lỗi trong quá trình xử lí dữ liệu");
                }else{
                    this.$toastr('error', response.data.message);
                    this.$router.push({ name: 'dashboard-lang', query: { page: this.$route.query.return } });
                }
            })
        }
    },
    mounted(){
    }
}
</script>