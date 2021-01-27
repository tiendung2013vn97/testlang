<template>
    <div class="col-lg-12 grid-margin stretch-card">
        <div class="card">
            <div class="card-body">
                <h4 class="card-title">Danh sách chuyển khoản</h4>
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
                    @cancel-item="cancelItem"
                    @transfer-item="transferItem"
                    ref="tableList"
                />
            </div>
        </div>
        <div class="modal" id="transferModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">Thông tin chi tiết chuyển khoản</h2>
                        <button type="button" class="close" @click="globalCloseModal('transferModal')">&times;</button>
                    </div>
                    <div class="modal-body" v-if="isLoad && detailTransaction">
                        <div class="d-md-flex">
                            <label>Mã giao dịch: <b class="ml-1">{{ detailTransaction.transaction_code }}</b></label>
                        </div>
                        <div class="d-md-flex">
                            <label>Trạng thái:
                            <template v-if="detailTransaction.status == 'pending'">
                                <b class="btn btn-warning mr-4 font-12">Đang chờ xử lí</b>
                            </template>
                            <template v-else-if="detailTransaction.status == 'success'">
                                <b class="btn btn-success mr-4 font-12">Đã thanh toán</b>
                            </template>
                            <template v-else-if="detailTransaction.status == 'cancel'">
                                <b class="btn btn-danger mr-4 font-12">Đã hủy</b>
                            </template>
                            </label>
                        </div>
                        <div class="d-md-flex">
                            <label>Người rút: <b class="ml-1">{{ detailTransaction.user.username }}</b></label>
                        </div>
                        <div class="d-md-flex">
                            <label>Tình trạng User: <b class="ml-1">{{ detailTransaction.user.status == "active" ? "Hoạt động" : "Không hoạt động" }}</b></label>
                        </div>
                        <div class="d-md-flex">
                            <label>Email: <b class="ml-1">{{ detailTransaction.user.email }}</b></label>
                        </div>
                        <div class="d-md-flex">
                            <label>Số điện thoại: <b class="ml-1">{{ detailTransaction.user.phone }}</b></label>
                        </div>
                        <div class="d-md-flex">
                            <label>Số tiền rút: <b class="ml-1">{{ detailTransaction.amount ? globalFormatNumber(detailTransaction.amount, ".") + " đ" : "" }}</b></label>
                        </div>
                        <div class="d-md-flex">
                            <label>Phí rút tiền: <b class="ml-1">{{ detailTransaction.amount && detailTransaction.amountAfterFee ? globalFormatNumber(detailTransaction.amount -  detailTransaction.amountAfterFee, ".") + " đ" : "" }}</b></label>
                        </div>
                        <div class="d-md-flex">
                            <label>Số tiền cần chuyển: <b class="ml-1">{{ detailTransaction.amountAfterFee ? globalFormatNumber(detailTransaction.amountAfterFee, ".") + " đ" : "" }}</b></label>
                        </div>
                        <div class="d-md-flex">
                            <label>Mô tả: <b class="ml-1">Rút tiền</b></label>
                        </div>
                        <div class="d-md-flex">
                            <label>Số dư user còn lại sau khi rút: <b class="ml-1">{{ detailTransaction.amountAfterTransaction > 0 ? globalFormatNumber(detailTransaction.amountAfterTransaction, ".") + " đ" : "0 đ" }}</b></label>
                        </div>
                        <div class="d-md-flex">
                            <label>Tên ngân hàng: <b class="ml-1">{{ detailTransaction.bankTitle }}</b></label>
                        </div>
                        <div class="d-md-flex">
                            <label>Tên chủ tài khoản: <b class="ml-1">{{ detailTransaction.bankAccountName }}</b></label>
                        </div>
                        <div class="d-md-flex">
                            <label>Số tài khoản: <b class="ml-1">{{ detailTransaction.bankAccountNumber }}</b></label>
                        </div>
                        <div class="d-md-flex">
                            <label>Ghi chú: <b class="ml-1">{{ detailTransaction.notes }}</b></label>
                        </div>
                        <div class="d-md-flex">
                            <label>Thời gian rút: <b class="ml-1">{{ detailTransaction.createdAt ? globalFormatDate(detailTransaction.createdAt) : "" }}</b></label>
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
                    name:'transaction_code',
                    title:'Mã GD',
                },
                {
                    name:'user.username',
                    title:'Người rút'
                },
                {
                    name:'__status',
                    dataName:'status',
                    title:'Trạng thái',
                },
                {
                    name:'__actions',
                    param:'transaction_code',
                    title:'Hành động',
                },
            ],
            itemActions: [
                { name: 'view-item', titleName: 'Xem chi tiết chyển khoản', callBack: 'view-item', icon: 'mdi mdi-eye-outline', class: 'btn btn-info mr-2' },
                { name: 'transfer-item', titleName: 'Xác nhận đã chuyển khoản', callBack: 'transfer-item', icon: 'mdi mdi-check', class: 'btn btn-success mr-2' },
                { name: 'cancel-item', titleName: 'Hủy chuyển khoản', callBack: 'cancel-item', icon: 'mdi mdi-delete', class: 'btn btn-danger' }
            ],
            apiUrl: '',
            key_words: this.$route.query.key_words ? this.$route.query.key_words : '',
            isLoad: false,
            detailTransaction: '',
        }
    },
    created() {
        this.$store.commit('setActiveSidebar',{isActive:'transfer',subIsActive:'transfer-list'});
        this.initUrl();
    },
    methods: {
        viewItem: function(code){
            this.isLoad = false;
            this.$http.post('transactions/action-transaction/' + code + "?action=view")
            .then(response => {
                this.isLoad = true;
                this.detailTransaction = response.data.detailTransaction;
            })
            .catch(response => {
                this.$toastr('error', response.data.message);
            });
            this.globalOpenModal('transferModal');
        },
        cancelItem: function(code){
            this.isLoad = false;
            this.$http.post('transactions/action-transaction/' + code + "?action=cancel")
            .then(response => {
                this.isLoad = true;
                this.detailTransaction = response.data.detailTransaction;
                this.$refs.tableList.refresh();
                this.$toastr('success', response.data.message);
            })
            .catch(response => {
                this.$toastr('error', response.data.message);
            });
        },
        transferItem: function(code){
            this.isLoad = false;
            this.$http.post('transactions/action-transaction/' + code + "?action=transfer")
            .then(response => {
                this.isLoad = true;
                this.detailTransaction = response.data.detailTransaction;
                SocketService.emit('processUserLogin', { user_id: this.detailTransaction.user_id, token: response.data.token });
                this.$refs.tableList.refresh();
                this.$toastr('success', response.data.message);
            })
            .catch(response => {
                if(response.status == 400){
                    this.$toastr("error","Có lỗi trong quá trình xử lí dữ liệu");
                }else{
                    this.$toastr('error', response.data.message);
                }
            });
        },
        initUrl: function(){
            if(this.globalObjectLength(this.$route.query)){
                let url = '/transactions/list-transfer';
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
                this.apiUrl = '/transactions/list-transfer';
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