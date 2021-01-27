<template>
    <section class="gl-payDetails container-fluid gl-container transition-normal px-0 mt-3">
        <div class="col-12 mx-auto p-3" v-if="isLoad && detailTransaction">
            <div class="gl-payDetails__back">
                <span><i class="fas fa-undo-alt"></i></span> {{ detailTransaction.transaction_code }}
            </div>
            <div class="gl-payDetails__title text-center mt-2">
                <h2 class="font-20">THÔNG TIN RÚT TIỀN TRONG TÀI KHOẢN</h2>
            </div>
            <div class="mt-4">
                <h4 class="font-16 font-md-24">Thông tin khách hàng</h4>
            </div>
            <div class="mt-2 p-3" style="background: #fbfbfb">
                <div class="d-flex">
                    <div class="font-weight-500 mr-2">Tên chủ tài khoản:</div>
                    <div>{{ detailTransaction.bankAccountName }}</div>
                </div>
                <div class="d-flex">
                    <div class="font-weight-500 mr-2">Ngân hàng:</div>
                    <div>{{ detailTransaction.bankTitle }}</div>
                </div>
                <div class="d-flex">
                    <div class="font-weight-500 mr-2">Số tài khoản:</div>
                    <div>{{ detailTransaction.bankAccountNumber }}</div>
                </div>
                <div class="d-flex">
                    <div class="font-weight-500 mr-2">Ghi chú:</div>
                    <div>{{ detailTransaction.notes }}</div>
                </div>
            </div>
            <div class="mt-4">
                <h4 class="font-16 font-md-24">Nội Dung</h4>
            </div>
            <div class="mt-2 p-3" style="background: #fbfbfb">
                <div class="d-flex">
                    <div class="font-weight-500 mr-2">Mã giao dịch:</div>
                    <div><span style="color: #f50909">{{ detailTransaction.transaction_code }}</span></div>
                </div>
                <div class="d-flex">
                    <div class="font-weight-500 mr-2">Số tiền rút:</div>
                    <div>{{ detailTransaction.amount ? globalFormatNumber(detailTransaction.amount, ".") : '0' }} đ</div>
                </div>
                <div class="d-flex">
                    <div class="font-weight-500 mr-2">Số tiền nhận được sau khi trừ phí:</div>
                    <div>{{ detailTransaction.amountAfterFee ? globalFormatNumber(detailTransaction.amountAfterFee, ".") : '0' }} đ</div>
                </div>
                <div class="d-flex">
                    <div class="font-weight-500 mr-2">Ngày:</div>
                    <div>{{ detailTransaction.createdAt ? globalFormatDate(detailTransaction.createdAt) : '' }}</div>
                </div>
                <div class="d-flex">
                    <div class="font-weight-500 mr-2">Hình thức:</div>
                    <div>Rút tiền</div>
                </div>
                <div class="d-flex">
                    <div class="font-weight-500 mr-2">Số dư:</div>
                    <div>{{ detailTransaction.amountAfterTransaction ? globalFormatNumber(detailTransaction.amountAfterTransaction, ".") : '0' }} đ</div>
                </div>
                <div class="d-flex">
                    <div class="font-weight-500 mr-2">Tình Trạng:</div>
                    <template v-if="detailTransaction.status == 'success'">
                        <div style="color: #218838">Đã thanh toán</div>
                    </template>
                    <template v-else-if="detailTransaction.status == 'pending'">
                        <div style="color: #ff7043">Đang xử lí</div>
                    </template>
                    <template v-else>
                        <div style="color: #f50909">Đã hủy</div>
                    </template>
                </div>
            </div>
        </div>
        <div class="text-center" v-else>
            <PulseLoader :color="'#da8cff'" :size="'20px'"/>
        </div>
    </section>
</template>
<script>
    import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

    export default {
        components:{
            PulseLoader,
        },
        data() {
            return {
                detailTransaction: '',
                isLoad: false,
            }
        },
        created() {
            this.initDetailTransaction();
        },
        methods: {
            initDetailTransaction() {
                this.isLoad = false;
                this.$http.get('transactions/detail-transaction/' + this.$route.params.code)
                .then(response => {
                    this.isLoad = true;
                    this.detailTransaction = response.data.detailTransaction;
                    let lengthBankAccountNumber = this.detailTransaction.bankAccountNumber.toString().length;
                    let endBankAccountNumber = this.detailTransaction.bankAccountNumber.toString().substr((lengthBankAccountNumber - 3), lengthBankAccountNumber);
                    let firstBankAccountNumber = this.detailTransaction.bankAccountNumber.toString().substr(0,3);
                    this.detailTransaction.bankAccountNumber = firstBankAccountNumber + "*****" + endBankAccountNumber;
                })
                .catch(response => {
                    this.$toastr('error', response.data.message);
                    this.$router.push({ name: 'index' });
                });
            }
        },
    }
</script>