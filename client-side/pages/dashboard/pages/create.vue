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
                <PageForm :pages="pages"/>
            </div>
        </template>
    </div>
</template>

<script>
import PageForm from '~/components/dashboard/form/Page.vue';
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
        this.$store.commit('setActiveSidebar', { isActive: 'pages', subIsActive: 'page-create' });
        this.initNew();
    },
    methods: {
        initNew: function(){
            setTimeout(function() {
                this.isLoad = false;
            }.bind(this), 1000);
            this.pages = {
                title: '',
                content: '',
                seo_title: '',
                seo_content: '',
                seo_keywords: '',
                seo_imageStr: '',
            };
        }
    },
    
}
</script>