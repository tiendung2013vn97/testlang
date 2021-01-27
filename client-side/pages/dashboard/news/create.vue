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
                <NewForm :news="news"/>
            </div>
        </template>
    </div>
</template>

<script>
import NewForm from '~/components/dashboard/form/New.vue';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

export default {
    components:{
        NewForm,
        PulseLoader
    },
    data() {
        return {
            news: '',
            isLoad: true,
        }
    },
    created() {
        this.$store.commit('setActiveSidebar', { isActive: 'news', subIsActive: 'new-create' });
        this.initNew();
    },
    methods: {
        initNew: function(){
            setTimeout(function() {
                this.isLoad = false;
            }.bind(this), 1000);
            this.news = {
                title: '',
                imageStr: '',
                description:'',
                content:'',
                createdBy:'',
                status: 'active',
                categories: [],
            };
        }
    },
    
}
</script>