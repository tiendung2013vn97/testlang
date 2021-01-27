<template>
    <section class="gl-withdrawal container gl-padding-content" v-if="setting">
        <div class="gl-withdrawal__content mx-auto border-radius-10 px-sm-5 pt-4 pb-5">
            <h1 class="font-24 font-md-30 font-weight-bold mb-1 text-center text-uppercase">Rút tiền</h1>
            <p class="text font-14 font-md-16 text-center mx-lg-auto pl-md-5 pr-md-4 px-lg-0 mb-4">
                Nhập chính xác thông tin để xác nhận rút tiền. Mỗi lần rút phải từ 10.000 đ trở lên, phí rút tiền: {{ globalFormatNumber(setting.more_withdrawal_fee,".") }} đ mỗi lần rút về ngân hàng
            </p>
            <div class="detail pl-md-5 pr-md-4">
                <div class="form-input">
                    <div class="mt-3">
                        <label class="font-weight-bold font-openSans font-14 font-md-16 mb-0">Số tiền *</label>
                        <input class="border-0 border-radius-10 font-openSans font-14 font-md-16 w-100 mt-2 py-2 px-4" required type="number" placeholder="Nhập số tiền, VD: 50000" v-model="userDt.amount" autocomplete="off"/>
                        <template v-if="globalObjectLength(errors)">
                            <template v-for="(error, id) in errors[`amount`]">
                                <div :key="id" class="text-danger d-flex mt-2">{{ error }}</div>
                            </template>
                        </template>
                    </div>
                    <div class="mt-3">
                        <label class="font-weight-bold font-openSans font-14 font-md-16 mb-0">Ngân hàng *</label>
                        <input class="border-0 border-radius-10 font-openSans font-14 font-md-16 w-100 mt-2 py-2 px-4" required type="text" placeholder="Nhập tên ngân hàng, VD: Agribank, TPBank, Đông Á Bank(DAB)..." v-model="userDt.bankTitle" autocomplete="off"/>
                        <template v-if="globalObjectLength(errors)">
                            <template v-for="(error, id) in errors[`bankTitle`]">
                                <div :key="id" class="text-danger d-flex mt-2">{{ error }}</div>
                            </template>
                        </template>
                    </div>
                    <div class="mt-3">
                        <label class="font-weight-bold font-openSans font-14 font-md-16 mb-0">Tên chủ khoản *</label>
                        <input class="border-0 border-radius-10 font-openSans font-14 font-md-16 w-100 mt-2 py-2 px-4" required type="text" placeholder="Nhập tên chủ tài khoản" v-model="userDt.bankAccountName" autocomplete="off"/>
                        <template v-if="globalObjectLength(errors)">
                            <template v-for="(error, id) in errors[`bankAccountName`]">
                                <div :key="id" class="text-danger d-flex mt-2">{{ error }}</div>
                            </template>
                        </template>
                    </div>
                    <div class="mt-3">
                        <label class="font-weight-bold font-openSans font-14 font-md-16 mb-0">Số tài khoản</label>
                        <input class="border-0 border-radius-10 font-openSans font-14 font-md-16 w-100 mt-2 py-2 px-4" type="number" placeholder="Nhập số tài khoản" v-model="userDt.bankAccountNumber" autocomplete="off"/>
                        <template v-if="globalObjectLength(errors)">
                            <template v-for="(error, id) in errors[`bankAccountNumber`]">
                                <div :key="id" class="text-danger d-flex mt-2">{{ error }}</div>
                            </template>
                        </template>
                    </div>
                    <div class="mt-3">
                        <label class="font-weight-bold font-openSans font-14 font-md-16 mb-0">Ghi chú thêm</label>
                        <textarea class="border-0 border-radius-10 font-14 font-md-16 w-100 mt-2 py-3 px-4" placeholder="Ghi chú thêm..." v-model="userDt.notes"></textarea>
                    </div>
                </div>
                <div class="button-load text-center mt-3 mt-md-4">
                    <button type="button" class="btn-upload font-16 font-md-18 py-2 w-100 w-md-50" @click="submit" :disabled="disabledSubmit">
                        <span v-if="disabledSubmit">
                            <PulseLoader :color="'white'" :size="'10px'"/>
                        </span>
                        <span v-else class="font-16">
                            Tiến hành rút tiền
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>

<script type="text/javascript">
import UploadFile from '~/components/common/UploadFile.vue';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import AuthService from '~/services/auth.service';

export default {
    components: {
        PulseLoader,
        UploadFile,
        AuthService,
    },
    data() {
        return {
            disabledSubmit: false,
            errors: {},
            userDt: {
                amount: '',
                bankTitle: '',
                bankAccountName: '',
                bankAccountNumber: '',
                notes: '',
            },
            setting: '',
            user: this.$store.state.user.data,
        }
    },
    created() {
        this.$store.dispatch('user/authentication', { url: '', route: this.$route });
        this.initSetting();
    },
    methods: {
        submit: function(){
            this.disabledSubmit = true;
            this.errors = {};
            this.$http.post('/transactions/withdrawal', this.userDt)
            .then( response => {
                this.disabledSubmit = false;
                alert("- Số tiền rút: " + this.globalFormatNumber(this.userDt.amount, ',') + "đ \n- Số dư còn lại sau giao dịch: " + this.globalFormatNumber((this.user.balance - this.userDt.amount), ',') + "đ \n- Phí rút tiền: " + this.globalFormatNumber(this.setting.more_withdrawal_fee, ',') + "đ \n- Số tiền nhận được: " + this.globalFormatNumber((this.userDt.amount - this.setting.more_withdrawal_fee), ',') + "đ");
                this.$toastr('success', response.data.message);
                this.$router.push({ name: 'index' });
            })
            .catch( response => {
                this.disabledSubmit = false;
                if(response.status == 400){
                    this.errors = response.data.errors;
                    this.$toastr("error","Có lỗi trong quá trình xử lí dữ liệu");
                }else{
                    this.$toastr('error', response.data.message);
                }
            })
        },
        initSetting: function() {
            this.$http.get('settings?type=more')
            .then( response => {
                this.setting = response.data.data;
            })
        }
    },
}
</script>