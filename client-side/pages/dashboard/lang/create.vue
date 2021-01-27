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
                <LangForm :langs="langs"/>
            </div>
        </template>
    </div>
</template>

<script>
import LangForm from '~/components/dashboard/form/Lang.vue';
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
        this.$store.commit('setActiveSidebar', { isActive: 'langs', subIsActive: 'lang-create' });
        this.initLang();
    },
    methods: {
        initLang: function(){
            setTimeout(function() {
                this.isLoad = false;
            }.bind(this), 1000);
            this.langs = {
                code:'',
                title: '',
                imageStr: '',
                description:'',
            };
        }
    },
    
}
</script>