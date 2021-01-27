<template>
    <section class="gl-pay-history container gl-padding-content">
        <div class="overflow-auto py-2">
            <div class="d-flex justify-content-lg-center">
                <div class="item-history pr-3" v-for="(tab, index) in tabs" @click="currentTab = index">
                    <div class="tab-click btn font-openSans cursor-pointer" :class="{ active: currentTab === index }">{{ tab }}</div>
                </div>
            </div>
        </div>
        <div class="gl-pay-history__content mt-2 pb-5">
            <div class="tab-recharge" v-if="currentTab === 0">
                <div class="calendar-search row">
                    <div class="col-12 col-md-6">
                        <div class="calendar">
                            <date-picker class="w-100" v-model="date" valueType="format" :format="dateFormat" confirm type="date" range placeholder="Select date range" lang="en" ></date-picker>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 mt-3 mt-md-0">
                        <button class="btn-upload w-100 py-2" @click="initHistoryTransaction('recharge')">Tìm Kiếm</button>
                    </div>
                </div>
                <div class="detail overflow-auto mt-4 py-2">
                    <div class="d-inline-block d-md-block">
                        <div class="title bg-gray d-flex">
                            <div class="col-lg item-title text-center py-2">
                                <h2 class="mb-0 font-openSans font-weight-bold font-14 font-md-16">Mã giao dịch</h2>
                            </div>
                            <div class="col-lg item-title text-center py-2">
                                <h2 class="mb-0 font-openSans font-weight-bold font-14 font-md-16">Số tiền nộp</h2>
                            </div>
                            <div class="col-lg item-title text-center py-2">
                                <h2 class="mb-0 font-openSans font-weight-bold font-14 font-md-16">Thời gian</h2>
                            </div>
                            <div class="col-lg item-title text-center py-2">
                                <h2 class="mb-0 font-openSans font-weight-bold font-14 font-md-16">Cổng thanh toán</h2>
                            </div>
                            <div class="col-lg item-title text-center py-2">
                                <h2 class="mb-0 font-openSans font-weight-bold font-14 font-md-16">Số dư</h2>
                            </div>
                        </div>
                        <template v-if="isLoad">
                            <template v-if="historyTransaction.data && historyTransaction.data.length">
                                <template v-for="data in historyTransaction.data">
                                    <div class="descrip d-flex">
                                        <div class="col-lg item-title text-center py-2">
                                            <p class="mb-0 font-14 font-md-16">{{ data.transaction_code ? data.transaction_code : '' }}</p>
                                        </div>
                                        <div class="col-lg item-title text-center py-2">
                                            <p class="mb-0 font-14 font-md-16">{{ data.amount && data.amount > 0 ? "+" + globalFormatNumber(data.amount, ",") + " đ" : " 0 đ" }}</p>
                                        </div>
                                        <div class="col-lg item-title text-center py-2">
                                            <p class="mb-0 font-14 font-md-16">{{ data.createdAt ? globalFormatDate(data.createdAt) : '' }}</p>
                                        </div>
                                        <div class="col-lg item-title text-center py-2">
                                            <p class="mb-0 font-14 font-md-16">{{ data.payment ? data.payment.title : '' }}</p>
                                        </div>
                                        <div class="col-lg item-title text-center py-2">
                                            <p class="mb-0 font-14 font-md-16">{{ data.amountAfterTransaction && data.amountAfterTransaction > 0 ? globalFormatNumber(data.amountAfterTransaction, ",") + "đ" : "0đ" }}</p>
                                        </div>
                                    </div>
                                </template>
                                <Pagination :tablePagination="historyTransaction" :paramsPage="current_page" @changePage="changePage" isScroll="no"/>
                            </template>
                            <template v-else>
                                <div class="descrip text-center py-2">
                                    Không có dữ liệu
                                </div>
                            </template>
                        </template>
                        <template v-else>
                            <div class="descrip text-center py-2">
                                <PulseLoader :color="'#da8cff'" :size="'20px'"/>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
            <div class="tab-withdrawal" v-if="currentTab === 1">
                <div class="calendar-search row">
                    <div class="col-12 col-md-6">
                        <div class="calendar">
                            <date-picker class="w-100" v-model="date" valueType="format" :format="dateFormat" confirm type="date" range placeholder="Select date range" lang="en" ></date-picker>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 mt-3 mt-md-0">
                        <button class="btn-upload w-100 py-2" @click="initHistoryTransaction('withdrawal')">Tìm Kiếm</button>
                    </div>
                </div>
                <div class="detail overflow-auto mt-4 py-2">
                    <div class="d-inline-block d-md-block">
                        <div class="title bg-gray d-flex">
                            <div class="col-lg item-title text-center py-2">
                                <h2 class="mb-0 font-weight-bold font-openSans font-14 font-md-16">Mã giao dịch</h2>
                            </div>
                            <div class="col-lg item-title text-center py-2">
                                <h2 class="mb-0 font-weight-bold font-openSans font-14 font-md-16">Số tiền rút</h2>
                            </div>
                            <div class="col-lg item-title text-center py-2">
                                <h2 class="mb-0 font-weight-bold font-openSans font-14 font-md-16">Phí rút tiền</h2>
                            </div>
                            <div class="col-lg item-title text-center py-2">
                                <h2 class="mb-0 font-weight-bold font-openSans font-14 font-md-16">Số tiền nhận được</h2>
                            </div>
                            <div class="col-lg item-title text-center py-2">
                                <h2 class="mb-0 font-weight-bold font-openSans font-14 font-md-16">Thời gian</h2>
                            </div>
                            <div class="col-lg item-title text-center py-2">
                                <h2 class="mb-0 font-weight-bold font-openSans font-14 font-md-16">Số dư</h2>
                            </div>
                            <div class="col-lg item-title text-center py-2">
                                <h2 class="mb-0 font-weight-bold font-openSans font-14 font-md-16">Tình trạng</h2>
                            </div>
                        </div>
                        <template v-if="isLoad">
                            <template v-if="historyTransaction.data && historyTransaction.data.length">
                                <template v-for="data in historyTransaction.data">
                                    <div class="descrip d-flex">
                                        <div class="col-lg item-title text-center py-2">
                                            <p class="mb-0 font-14 font-md-16">
                                                <nuxt-link :to="{ name: 'profile-pay-code', params: { code: data.transaction_code ? data.transaction_code : ''} }">
                                                    {{ data.transaction_code ? data.transaction_code : '' }}
                                                </nuxt-link>
                                            </p>
                                        </div>
                                        <div class="col-lg item-title text-center py-2">
                                            <p class="mb-0 font-14 font-md-16">
                                                {{ data.status == 'success' ? "-" : "" }}
                                                {{ data.amount && data.amount > 0 ? globalFormatNumber(data.amount, ",") + "đ" : "0đ" }}
                                            </p>
                                        </div>
                                        <div class="col-lg item-title text-center py-2">
                                            <p class="mb-0 font-14 font-md-16">-{{ data.amountAfterFee && data.amount > 0 ? globalFormatNumber((data.amount - data.amountAfterFee), ",") + "đ" : "0đ" }}</p>
                                        </div>
                                        <div class="col-lg item-title text-center py-2">
                                            <p class="mb-0 font-14 font-md-16">{{ data.amountAfterFee > 0 ? globalFormatNumber(data.amountAfterFee, ",") + "đ" : "0đ" }}</p>
                                        </div>
                                        <div class="col-lg item-title text-center py-2">
                                            <p class="mb-0 font-14 font-md-16">{{ data.createdAt ? globalFormatDate(data.createdAt) : '' }}</p>
                                        </div>
                                        <div class="col-lg item-title text-center py-2">
                                            <p class="mb-0 font-14 font-md-16">{{ data.amountAfterTransaction && data.amountAfterTransaction > 0 ? globalFormatNumber(data.amountAfterTransaction, ",") + "đ" : " 0đ" }}</p>
                                        </div>
                                        <div class="col-lg item-title text-center py-2">
                                            <p class="mb-0 font-14 font-md-16">
                                                <template v-if="data.status == 'success'">
                                                    <button type="button" class="btn btn-success">Đã thanh toán</button>
                                                </template>
                                                <template v-else-if="data.status == 'pending'">
                                                    <button type="button" class="btn btn-warning" @click="actionTransaction(data.transaction_code, 'cancel')">Đang xử lí</button>
                                                </template>
                                                <template v-else-if="data.status == 'cancel'">
                                                    <button type="button" class="btn btn-danger">Đã hủy</button>
                                                </template>
                                            </p>
                                        </div>
                                    </div>
                                </template>
                                <Pagination :tablePagination="historyTransaction" :paramsPage="current_page" @changePage="changePage" isScroll="no"/>
                            </template>
                            <template v-else>
                                <div class="descrip text-center py-2">
                                    Không có dữ liệu
                                </div>
                            </template>
                        </template>
                        <template v-else>
                            <div class="descrip text-center py-2">
                                <PulseLoader :color="'#da8cff'" :size="'20px'"/>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
            <div class="tab-video" v-if="currentTab === 2">
                <div class="calendar-search row">
                    <div class="col-12 col-md-6">
                        <div class="calendar">
                            <date-picker class="w-100" v-model="date" valueType="format" :format="dateFormat" confirm type="date" range placeholder="Select date range" lang="en" ></date-picker>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 mt-3 mt-md-0">
                        <button class="btn-upload w-100 py-2" @click="initHistoryTransaction('payment-video')">Tìm Kiếm</button>
                    </div>
                </div>
                <div class="detail overflow-auto mt-4 py-2">
                    <div class="d-inline-block d-md-block">
                        <div class="title bg-gray d-flex">
                            <div class="col-lg item-title text-center py-2">
                                <h2 class="mb-0 font-weight-bold font-openSans font-14 font-md-16">Tên video</h2>
                            </div>
                            <div class="col-lg item-title text-center py-2">
                                <h2 class="mb-0 font-weight-bold font-openSans font-14 font-md-16">Giá video</h2>
                            </div>
                            <div class="col-lg item-title text-center py-2">
                                <h2 class="mb-0 font-weight-bold font-openSans font-14 font-md-16">Ngôn ngữ</h2>
                            </div>
                            <div class="col-lg item-title text-center py-2">
                                <h2 class="mb-0 font-weight-bold font-openSans font-14 font-md-16">Thời gian</h2>
                            </div>
                            <div class="col-lg item-title text-center py-2">
                                <h2 class="mb-0 font-weight-bold font-openSans font-14 font-md-16">số dư</h2>
                            </div>
                        </div>
                        <template v-if="isLoad">
                            <template v-if="historyTransaction.data && historyTransaction.data.length">
                                <template v-for="data in historyTransaction.data">
                                    <div class="descrip d-flex">
                                        <div class="col-lg item-title text-center py-2">
                                            <p class="mb-0 font-14 font-md-16">
                                                <nuxt-link :to="{ name: 'video-slug', params: { slug: data.slug ? data.slug : ''} }" class="mt-1 h-3em overflow-hidden text-body pr-3 mr-2 font-12 font-lg-16">
                                                    {{ data.title ? data.title : '' }}
                                                </nuxt-link>
                                            </p>
                                        </div>
                                        <div class="col-lg item-title text-center py-2">
                                            <p class="mb-0 font-14 font-md-16">{{ data.payments_users[0].video_payment.price && data.payments_users[0].video_payment.price > 0 ? "-" + globalFormatNumber(data.payments_users[0].video_payment.price, ",") + " đ" : "0 đ" }}</p>
                                        </div>
                                        <div class="col-lg item-title text-center py-2">
                                            <p class="mb-0 font-14 font-md-16">{{ data.raw_lang.title ? data.raw_lang.title + " - " : "" }} {{ data.translate_lang.title ? data.translate_lang.title : "" }}</p>
                                        </div>
                                        <div class="col-lg item-title text-center py-2">
                                            <p class="mb-0 font-14 font-md-16">{{ data.payments_users && data.payments_users[0].video_payment.createdAt ? globalFormatDate(data.payments_users[0].video_payment.createdAt) : '' }}</p>
                                        </div>
                                        <div class="col-lg item-title text-center py-2">
                                            <p class="mb-0 font-14 font-md-16">{{ data.payments_users[0].video_payment.amount_buyer && data.payments_users[0].video_payment.amount_buyer > 0 ? globalFormatNumber(data.payments_users[0].video_payment.amount_buyer, ",") + " đ" : "0 đ" }}</p>
                                        </div>
                                    </div>
                                </template>
                                <Pagination :tablePagination="historyTransaction" :paramsPage="current_page" @changePage="changePage" isScroll="no"/>
                            </template>
                            <template v-else>
                                <div class="descrip text-center py-2">
                                    Không có dữ liệu
                                </div>
                            </template>
                        </template>
                        <template v-else>
                            <div class="descrip text-center py-2">
                                <PulseLoader :color="'#da8cff'" :size="'20px'"/>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
            <div class="tab-pay" v-if="currentTab === 3">
                <div class="calendar-search row">
                    <div class="col-12 col-md-6">
                        <div class="calendar">
                            <date-picker class="w-100" v-model="date" valueType="format" :format="dateFormat" confirm type="date" range placeholder="Select date range" lang="en" ></date-picker>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 mt-3 mt-md-0">
                        <button class="btn-upload w-100 py-2" @click="initHistoryTransaction('receive-money')">Tìm Kiếm</button>
                    </div>
                </div>
                <div class="detail overflow-auto mt-4 py-2">
                    <div class="d-inline-block d-md-block">
                        <div class="title bg-gray d-flex">
                            <div class="col-lg item-title text-center py-2">
                                <h2 class="mb-0 font-weight-bold font-openSans font-14 font-md-16">Tên video</h2>
                            </div>
                            <div class="col-lg item-title text-center py-2">
                                <h2 class="mb-0 font-weight-bold font-openSans font-14 font-md-16">Giá video</h2>
                            </div>
                            <div class="col-lg item-title text-center py-2">
                                <h2 class="mb-0 font-weight-bold font-openSans font-14 font-md-16">Ngôn ngữ</h2>
                            </div>
                            <div class="col-lg item-title text-center py-2">
                                <h2 class="mb-0 font-weight-bold font-openSans font-14 font-md-16">Phí % hoa hồng</h2>
                            </div>
                            <div class="col-lg item-title text-center py-2">
                                <h2 class="mb-0 font-weight-bold font-openSans font-14 font-md-16">Thời gian</h2>
                            </div>
                            <div class="col-lg item-title text-center py-2">
                                <h2 class="mb-0 font-weight-bold font-openSans font-14 font-md-16">Số dư</h2>
                            </div>
                        </div>
                        <template v-if="isLoad">
                            <template v-if="historyTransaction.data && historyTransaction.data.length">
                                <template v-for="data in historyTransaction.data">
                                    <div class="descrip d-flex">
                                        <div class="col-lg item-title text-center py-2">
                                            <p class="mb-0 font-14 font-md-16">
                                                <nuxt-link :to="{ name: 'video-slug', params: { slug: data.video.slug ? data.video.slug : ''} }" class="mt-1 h-3em overflow-hidden text-body pr-3 mr-2 font-12 font-lg-16">
                                                    {{ data.video.title ? data.video.title : '' }}
                                                </nuxt-link>
                                            </p>
                                        </div>
                                        <div class="col-lg item-title text-center py-2">
                                            <p class="mb-0 font-14 font-md-16">{{ data.price ? globalFormatNumber(data.price, ",") + " đ" : "" }}</p>
                                        </div>
                                        <div class="col-lg item-title text-center py-2">
                                            <p class="mb-0 font-14 font-md-16">{{ data.video.raw_lang.title ? data.video.raw_lang.title + " - " : ""}} {{ data.video.translate_lang.title ? data.video.translate_lang.title : ""}}</p>
                                        </div>
                                        <div class="col-lg item-title text-center py-2">
                                            <p class="mb-0 font-14 font-md-16">{{ data.commission ? data.commission + "%" : "" }}</p>
                                        </div>
                                        <div class="col-lg item-title text-center py-2">
                                            <p class="mb-0 font-14 font-md-16">{{ globalFormatDate(data.createdAt) }}</p>
                                        </div>
                                        <div class="col-lg item-title text-center py-2">
                                            <p class="mb-0 font-14 font-md-16">{{ data.amount_seller ? globalFormatNumber(data.amount_seller, ",") + " đ" : "" }}</p>
                                        </div>
                                    </div>
                                </template>
                                <Pagination :tablePagination="historyTransaction" :paramsPage="current_page" @changePage="changePage" isScroll="no"/>
                            </template>
                            <template v-else>
                                <div class="descrip text-center py-2">
                                    Không có dữ liệu
                                </div>
                            </template>
                        </template>
                        <template v-else>
                            <div class="descrip text-center py-2">
                                <PulseLoader :color="'#da8cff'" :size="'20px'"/>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
<script>
    export default {
        data(){ 
            return{
                currentTab: 0,
                tabs: ['Lịch sử nạp tiền', 'Lịch sử rút tiền', 'Lịch sử mua video', 'Lịch sử cộng tiền'],
                date: [],
            }
        },
    };
</script>
<script>
    import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
    import Pagination from '~/components/common/pagination/VuePagination.vue';

    export default {
        components:{
            PulseLoader,
            Pagination,
        },
        data(){
            return{
                date: [],
                currentTab: 0,
                tabs: ['Lịch sử nạp tiền', 'Lịch sử rút tiền', 'Lịch sử mua video', 'Lịch sử cộng tiền'],
                historyTransaction: '',
                isLoad: false,
                current_page: 1,
                fromDate: '',
                toDate: '',
                dateFormat : 'YYYY/MM/DD',
            }
        },
        created() {
            this.initHistoryTransaction('recharge');
        },
        methods: {
            initHistoryTransaction(type) {
                this.isLoad = false;
                this.fromDate = this.date[0] ? this.date[0] : '';
                this.toDate = this.date[1] ? this.date[1] : '';
                this.$http.get('transactions/history-transaction?per_page=10&page=' + this.current_page + '&type=' + type + '&fromDate=' + this.fromDate + '&toDate=' + this.toDate)
                .then(response => {
                    this.isLoad = true;
                    this.historyTransaction = response.data.data;
                })
                .catch(response => {
                    if(response.status == 400){
                        this.isLoad = true;
                        this.historyTransaction = "";
                    }
                    this.fromDate = "";
                    this.toDate = "";
                    this.$toastr("error", response.data.message);
                });
            },
            changePage: function (page) {
                if (page === 'prev') {
                    this.gotoPreviousPage();
                } else if (page === 'next') {
                    this.gotoNextPage();
                } else {
                    this.gotoPage(page);
                }
            },
            gotoPreviousPage: function () {
                if (this.current_page > 1) {
                    this.current_page--
                }
            },
            gotoNextPage: function () {
                if (this.current_page < this.historyTransaction.last_page) {
                    this.current_page++
                }
            },
            gotoPage: function (page) {
                if (page != this.current_page && (page > 0 && page <= this.historyTransaction.last_page)) {
                    this.current_page = page;
                }
            },
            actionTransaction(code, actionType) {
                if(confirm("Xác nhận hủy giao dịch rút tiền?")){
                this.$http.post('transactions/action-transaction/' + code + "?action=" + actionType)
                    .then(response => {
                        if(this.currentTab == 0){
                            this.initHistoryTransaction('recharge');
                        }else if(this.currentTab == 1){
                            this.initHistoryTransaction('withdrawal');
                        }else if(this.currentTab == 2){
                            this.initHistoryTransaction('payment-video');
                        }else if(this.currentTab == 3){
                            this.initHistoryTransaction('receive-money');
                        }
                        this.$toastr('success', response.data.message);
                    })
                }
            },
        },
        watch: {
            'current_page': function() {
                if(this.currentTab == 0){
                    this.initHistoryTransaction('recharge');
                }else if(this.currentTab == 1){
                    this.initHistoryTransaction('withdrawal');
                }else if(this.currentTab == 2){
                    this.initHistoryTransaction('payment-video');
                }else if(this.currentTab == 3){
                    this.initHistoryTransaction('receive-money');
                }
            },
            'currentTab': function() {
                this.fromDate = "";
                this.toDate = "";
                this.historyTransaction = '';
                this.current_page = 1;
                if(this.currentTab == 0){
                    this.initHistoryTransaction('recharge');
                }else if(this.currentTab == 1){
                    this.initHistoryTransaction('withdrawal');
                }else if(this.currentTab == 2){
                    this.initHistoryTransaction('payment-video');
                }else if(this.currentTab == 3){
                    this.initHistoryTransaction('receive-money');
                }
            }
        }
    };
</script>