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
            <div class="col-12 grid-margin stretch-card">
                <CategoryForm :category="category"/>
            </div>
        </template>
    </div>
</template>

<script>
import CategoryForm from '~/components/dashboard/form/Category.vue';
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
        this.$store.commit('setActiveSidebar', { isActive: 'categories', subIsActive: 'category-create' });
        this.initCategory();
    },
    methods: {
        initCategory: function(){
            setTimeout(function() {
                this.isLoad = false;
            }.bind(this), 500);
            this.category = {
                title: '',
                iconStr: '',
            };
        }
    },
    
}
</script>