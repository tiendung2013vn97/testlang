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
            <div class="col-12 grid-margin stretch-card" v-if="category">
                <CategoryForm :category="category"/>
            </div>
        </template>
    </div>
</template>
<script>
import CategoryForm from '~/components/dashboard/form/Category.vue';
import SocketService from '~/services/socket.service';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

export default {
    components:{
        CategoryForm,
        PulseLoader
    },
    data() {
        return {
            category: '',
            isLoad: true,
        }
    },
    created() {
        this.$store.commit('setActiveSidebar', { isActive: 'categories' });
        this.initCategory();
    },
    methods: {
        initCategory: function() {
            this.isLoad = true;
            this.$http.get('categories/edit/' + this.$route.params.id)
            .then( response => {
                this.category = response.data.data;
                this.category.iconStr = '';
                this.isLoad = false;
            })
            .catch( response => {
                this.category = '';
                this.isLoad = false;
                if(response.status == 400){
                    this.$toastr("error","Có lỗi trong quá trình xử lí dữ liệu");
                }else{
                    this.$toastr('error', response.data.message);
                    this.$router.push({ name: 'dashboard-categories', query: { page: this.$route.query.return } });
                }
            })
        }
    },
    mounted(){
    }
}
</script>