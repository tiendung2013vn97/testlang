<template>
    <div class="col-lg-12 grid-margin stretch-card">
        <div class="card">
            <div class="card-body">
                <h4 class="card-title">Danh sách tài khoản</h4>
                <p class="card-description">
                    Danh sách
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
                    @view-item="viewItem"
                    @block-item="blockItem"
                    @unblock-item="unBlockItem"
                    @change-user-type="changeUserType"
                    ref="tableList"
                />
            </div>
        </div>
        <div class="modal" id="transferModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">Thông tin chi tiết tài khoản</h2>
                        <button type="button" class="close" @click="globalCloseModal('transferModal')">&times;</button>
                    </div>
                    <div class="modal-body" v-if="isLoad && user">
                        <div class="d-md-flex">
                            <label>Email: <b class="ml-1">{{ user.email }}</b></label>
                        </div>
                        <div class="d-md-flex">
                            <label>Username: <b class="ml-1">{{ user.username }}</b></label>
                        </div>
                        <div class="d-md-flex">
                            <label>Trạng thái:
                            <template v-if="user.status == 'inactive'">
                                <b class="btn btn-warning mr-4 font-12">Chưa kích hoạt</b>
                            </template>
                            <template v-else-if="user.status == 'active'">
                                <b class="btn btn-success mr-4 font-12">Kích hoạt</b>
                            </template>
                            <template v-else-if="user.status == 'banned'">
                                <b class="btn btn-danger mr-4 font-12">Cấm</b>
                            </template>
                            </label>
                        </div>
                        <div class="d-md-flex">
                            <label>Loại tài khoản: <b class="ml-1">{{ user.account_type }}</b></label>
                        </div>
                        <div class="d-md-flex">
                            <label>Số điện thoại: <b class="ml-1">{{ user.phone }}</b></label>
                        </div>
                        <div class="d-md-flex">
                            <label>Số tiền trong tài khoản: <b class="ml-1">{{ globalFormatNumber(user.balance, ".") + " đ" }}</b></label>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-danger" @click="globalCloseModal('transferModal')">Đóng</button>
                        </div>
                    </div>
                    <div class="modal-body text-center" v-else>
                        <PulseLoader :color="'#da8cff'" :size="'20px'"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import TableList from '~/components/dashboard/table/Vuetable.vue';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import SocketService from '~/services/socket.service';

export default {
    components: {
        TableList,
        PulseLoader,
        SocketService,
    },
    data(){
        return{
            columns:[
                {
                    name:'email',
                    title:'Email',
                },
                {
                    name:'user.username',
                    title:'Username'
                },
                {
                    name:'account_type',
                    dataName:'account_type',
                    title:'Loại tài khoản',
                },
                {
                    name:'__status',
                    dataName:'status',
                    title:'Trạng thái',
                },
                {
                    name:'__actions',
                    param:'id',
                    title:'Hành động',
                },
            ],
            itemActions: [
                { name: 'view-item', titleName: 'Xem chi tiết tài khoản', callBack: 'view-item', icon: 'mdi mdi-eye-outline', class: 'btn btn-info mr-2' },
                { name: 'block-item', titleName: 'Khóa tài khoản', callBack: 'block-item', icon: 'mdi mdi-block-helper', class: 'btn btn-danger mr-2' },
                { name: 'unblock-item', titleName: 'Mở khóa tài khoản', callBack: 'unblock-item', icon: 'mdi mdi-account-check', class: 'btn btn-success mr-2' },
                { name: 'change-user-type', titleName: 'Chuyển loại tài khoản', callBack: 'change-user-type', icon: 'mdi mdi-account-switch', class: 'btn btn-success' }
            ],
            apiUrl: '',
            key_words: this.$route.query.key_words ? this.$route.query.key_words : '',
            isLoad: false,
            user: '',
        }
    },
    created() {
        this.$store.commit('setActiveSidebar',{isActive:'users',subIsActive:'user-list'});
        this.initUrl();
    },
    methods: {
        viewItem: function(id){
            this.isLoad = false;
            this.$http.get('user/' + id + "/detail")
            .then(response => {
                this.isLoad = true;
                this.user = response.data.user;
            })
            .catch(response => {
                this.$toastr('error', response.data.message);
            });
            this.globalOpenModal('transferModal');
        },
        blockItem: function(id){
            this.isLoad = false;
            this.$http.post('user/' + id + '/block')
            .then(response => {
                this.isLoad = true;
                SocketService.emit('processUserLogin', { user_id: id, token: response.data.token });
                this.$refs.tableList.refresh();
                this.$toastr('success', response.data.message);
            })
            .catch(response => {
                this.$toastr('error', response.data.message);
            });
        },
        unBlockItem: function(id){
            this.isLoad = false;
            this.$http.post('user/' + id + '/unblock')
            .then(response => {
                this.isLoad = true;
                this.$refs.tableList.refresh();
                this.$toastr('success', response.data.message);
            })
            .catch(response => {
                this.$toastr('error', response.data.message);
            });
        },
        changeUserType: function(id){
            this.isLoad = false;
            this.$http.post('user/' + id + '/switch-type')
            .then(response => {
                this.isLoad = true;
                this.$refs.tableList.refresh();
                this.$toastr('success', response.data.message);
            })
            .catch(response => {
                this.$toastr('error', response.data.message);
            });
        },
        initUrl: function(){
            if(this.globalObjectLength(this.$route.query)){
                let url = '/user';
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
                this.apiUrl = '/user';
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