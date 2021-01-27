<template>
    <div class="col-lg-12 grid-margin stretch-card">
        <div class="card">
            <div class="card-body">
                <h4 class="card-title">Danh sách tin tức</h4>
                <p class="card-description">
                    Tin tức
                </p>
                <form class="form-group d-flex" v-on:submit.prevent="searchKeyword">
                    <input type="text" class="form-control col-4 mt-2" placeholder="Nhập từ khóa tìm kiếm" v-model="key_words">
                    <button type="submit" class="btn btn-success ml-2 form-group" @click="searchKeyword">
                        <i class="mdi mdi-search-web" style="font-size: 20px;"></i>
                    </button>
                </form>
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
                    name: 'title',
                    title: 'Tên',
                },
                {
                    name: '__list',
                    listName:'categories',
                    dataName:'title',
                    title: 'Danh mục',
                },
                {
                    name: 'createdBy',
                    title: 'Người tạo',
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
        this.$store.commit('setActiveSidebar', { isActive: 'news', subIsActive: 'new-list' });
        this.initUrl();
    },
    methods: {
        editItem: function(id){
            this.$router.push({ name: 'dashboard-news-update-id', params: { id: id }, query: { return: this.$route.query.page } });
        },
        deleteItem: function(id){
            this.$http.post('news/delete/' + id)
            .then( response => {
                this.$refs.tableList.refresh();
                this.$toastr('success', response.data.message);
            })
        },
        initUrl: function(){
            if(this.globalObjectLength(this.$route.query)){
                let url = '/news';
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
                this.apiUrl = '/news';
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