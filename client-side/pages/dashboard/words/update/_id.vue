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
            <div class="col-12 grid-margin stretch-card" v-if="translate">
                <TranslateForm :translate="translate"/>
            </div>
        </template>
    </div>
</template>
<script>
import TranslateForm from '~/components/dashboard/form/Translate.vue';
import SocketService from '~/services/socket.service';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

export default {
    components:{
        TranslateForm,
        PulseLoader
    },
    data() {
        return {
            translate: '',
            isLoad: true,
        }
    },
    created() {
        this.$store.commit('setActiveSidebar', { isActive: 'translate', subIsActive: 'word' });
        this.initTranslate();
    },
    methods: {
        initTranslate: function() {
            this.isLoad = true;
            this.$http.get('translate/update/' + this.$route.params.id + '?type=word')
            .then( response => {
                this.translate = response.data.data;
                this.isLoad = false;
            })
            .catch( response => {
                this.translate = '';
                this.isLoad = false;
                if(response.status == 400){
                    this.$toastr("error","Có lỗi trong quá trình xử lí dữ liệu");
                }else{
                    this.$toastr('error', response.data.message);
                    this.$router.push({ name: 'dashboard-each-word', query: { page: this.$route.query.return } });
                }
            })
        }
    },
    mounted(){
    }
}
</script>