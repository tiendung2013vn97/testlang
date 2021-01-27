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
                <TranslateForm :translate="translate"/>
            </div>
        </template>
    </div>
</template>

<script>
import TranslateForm from '~/components/dashboard/form/Translate.vue';
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
        this.$store.commit('setActiveSidebar', { isActive: 'translate', subIsActive: 'pronoun' });
        this.initLang();
    },
    methods: {
        initLang: function(){
            setTimeout(function() {
                this.isLoad = false;
            }.bind(this), 1000);
            this.translate = {
                languages: [],
                words:'',
                translate: '',
                description:'',
            };
        }
    },
    
}
</script>