<template>
    <div class="gl-container terms-of-use">
        <div class="container">
            <div class="row">
                <div class="col-12 px-2 bg-white py-4" v-if="page">
                    <h3 class="">
                        {{ page.title }}
                    </h3>
                    <hr class="mx-n2">
                    <ul class="list-style-type-decimal" v-html="page.content">
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            page: '',
        };
    },
    created() {
        this.initPage();
    },
    methods: {
        initPage: function() {
            this.$http.get('pages/detail/' + this.$route.params.slug)
            .then( response => {
                this.page = response.data.data;
            })
            .catch( response => {
                this.$router.push({ path: '/error' });
            });
        }
    },
}
</script>
