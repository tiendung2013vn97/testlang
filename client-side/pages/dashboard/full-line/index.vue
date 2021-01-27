<template>
    <div class="col-lg-12 grid-margin stretch-card">
        <div class="card">
            <div class="card-body">
                <h4 class="card-title">Danh sách dịch cả câu</h4>
                <p class="card-description">
                    Dịch cả câu
                </p>
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <form class="d-flex justify-content-between w-50" v-on:submit.prevent="searchKeyword">
                        <input type="text" class="form-control mt-2" placeholder="Nhập từ khóa tìm kiếm" v-model="key_words">
                        <button type="submit" class="btn btn-success ml-2" @click="searchKeyword">
                            <i class="mdi mdi-search-web" style="font-size: 20px;"></i>
                        </button>
                    </form>
                    <div class="">
                        <nuxt-link class="btn btn-success m-auto" :to="{ name: 'dashboard-full-line-create' }">Tạo mới</nuxt-link>
                    </div>
                </div>
                <TableList
                    :api-url="apiUrl"
                    :fields="columns"
                    :item-actions="itemActions"
                    :initialPage="$route.query.page"
                    @edit-item="editItem"
                    @delete-item="deleteItem"
                    ref="tableList"
                />
            </div>
        </div>
    </div>
</template>
<script>
import TableList from '~/components/dashboard/table/Vuetable.vue';

export default {
    components: {
        TableList,
    },
    data() {
        return{
            columns: [
                {
                    name: 'words',
                    title: 'Từ vựng',
                },
                {
                    name: 'translate',
                    title: 'Phiên dịch',
                },
                {
                    name: 'lang.lang_trans.title',
                    title: 'Ngôn ngữ gốc',
                },
                {
                    name: 'lang.trans_lang.title',
                    title: 'Ngôn ngữ dịch',
                },
                {
                    name: 'count',
                    title: 'Lượt dùng',
                },
                {
                    name: '__actions',
                    param: 'id',
                    title: 'Hành động',
                },
            ],
            itemActions: [
                { name: 'edit-item', callBack: 'edit-item', icon: 'mdi mdi-table-edit', class: 'btn btn-success mr-2' },
                { name: 'delete-item', callBack: 'delete-item', icon: 'mdi mdi-delete', class: 'btn btn-danger' },
            ],
            apiUrl: '',
            key_words: this.$route.query.key_words ? this.$route.query.key_words : '',
        }
    },
    created() {
        this.$store.commit('setActiveSidebar', { isActive: 'translate', subIsActive: 'full-line-list' });
        this.initUrl();
    },
    methods: {
        editItem: function(id){
            this.$router.push({ name: 'dashboard-full-line-update-id', params: { id: id }, query: { return: this.$route.query.page } });
        },
        deleteItem: function(id){
            this.$http.post('translate/delete/' + id + '?type=full_line')
            .then( response => {
                this.$refs.tableList.refresh();
                this.$toastr('success', response.data.message);
            })
        },
        initUrl: function(){
            if(this.globalObjectLength(this.$route.query)){
                let url = '/translate/list-full-lines';
                let i = 0;
                for(let key in this.$route.query){
                    if(key != 'page'){
                        let query = this.$route.query[key];
                        if(i == 0){
                            url = `${url}?${key}=${query}`;
                        }else{
                            url = `${url}&${key}=${query}`;
                        }
                        i++;
                    }
                }
                this.apiUrl = url;
            }else{
                this.apiUrl = '/translate/list-full-lines';
            }
        },
        searchKeyword: function() {
            this.$router.push({ query: { ...this.$route.query, key_words: this.key_words } });
        },
    },
    watch: {
        '$route.query': function(newVal, oldVal){
            if(newVal !== oldVal){
                this.initUrl();
            }
        }
    }
}
</script>