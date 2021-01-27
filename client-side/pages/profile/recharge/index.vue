<template>
    <section class="gl-recharge container gl-padding-content">
        <div class="gl-recharge__content mx-auto border-radius-10 px-sm-5 pt-4 pb-5">
            <h1 class="font-24 font-md-30 font-weight-bold mb-1 text-center text-uppercase">Nạp tiền</h1>
            <div class="row px-sm-4">
                <div class="col-12">
                    <p class="font-weight-500 font-openSans font-16 font-md-18">Chọn cổng thanh toán</p>
                    <div class="select-recharge d-flex justify-content-center">
                        <div class="mr-2" v-for="(payment, index) in payments">
                            <div class="item-select border-radius-10 text-center py-2">
                                <img :src="globalImageUrl(payment.image ? payment.image : 'images-asset/No_Image_Available.jpg')">
                                <p class="font-weight-bold mt-1 mb-0">{{ payment.title }}</p>
                            </div>
                            <label class="check-radio text-uppercase font-14 mt-2 mb-0">
                                <input type="radio" name="type" :checked="index == 0 ? 'checked' : ''" @click="choosePaymentMethod(payment)">
                                <span class="checkmark"></span>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="col-12 mt-4">
                    <p class="font-weight-500 font-openSans font-16 font-md-18">Chọn gói tiền cần nạp</p>
                    <div class="select-price row">
                        <div class="col-12 col-sm-6 col-md-4 py-2">
                            <div :class="priceChoose == 20000 ? 'active' : ''" class="item-price text-center bg-white py-1 border-radius-5 font-openSans font-14 font-md-16" @click="choosePrice(20000)">20,000 đ</div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 py-2">
                            <div :class="priceChoose == 50000 ? 'active' : ''" class="item-price text-center bg-white py-1 border-radius-5 font-openSans font-14 font-md-16" @click="choosePrice(50000)">50,000 đ</div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 py-2">
                            <div :class="priceChoose == 100000 ? 'active' : ''" class="item-price text-center bg-white py-1 border-radius-5 font-openSans font-14 font-md-16" @click="choosePrice(100000)">100,000 đ</div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 py-2">
                            <div :class="priceChoose == 200000 ? 'active' : ''" class="item-price text-center bg-white py-1 border-radius-5 font-openSans font-14 font-md-16" @click="choosePrice(200000)">200,000 đ</div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 py-2">
                            <div :class="priceChoose == 500000 ? 'active' : ''" class="item-price text-center bg-white py-1 border-radius-5 font-openSans font-14 font-md-16" @click="choosePrice(500000)">500,000 đ</div>
                        </div>
                        <div class="col-12 col-sm-6 col-md-4 py-2">
                            <div :class="priceChoose == 1000000 ? 'active' : ''" class="item-price text-center bg-white py-1 border-radius-5 font-openSans font-14 font-md-16" @click="choosePrice(1000000)">1,000,000 đ</div>
                        </div>
                    </div>
                </div>

                <div class="img">
                      <img :src="globalImageUrl('images-asset/img-banner.png')" class="border-radius-10 h-100 w-100"/>
                  </div>

                <div class="col-12 mt-4">
                    <div class="button-load text-center">
                        <button type="button" class="btn-upload font-13 font-md-16 w-100 w-md-50 py-2" @click="deposit" :disabled="disabledSubmit">
                            <span v-if="disabledSubmit">
                                <PulseLoader :color="'white'" :size="'10px'"/>
                            </span>
                            <span v-else class="font-14 font-openSans">
                                Tiến hành thanh toán
                            </span>
                        </button>
                    </div>
                </div>
 

            </div>
        </div>
    </section>
</template>

<script>
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

export default {
    components: {
        PulseLoader,
    },
    data() {
        return {
            payments: '',
            paymentChoose: '',
            priceChoose: '',
            disabledSubmit: false
        };
    },
    created() {
        this.initPayments();
    },
    methods: {
        initPayments: function() {
            this.$http.get('payments/all')
            .then(response => {
                this.payments = response.data.data;
                if(this.payments.length) {
                    this.paymentChoose = this.payments[0];
                    this.priceChoose = 20000;
                }
            })
        },
        choosePaymentMethod: function(payment) {
            this.paymentChoose = payment;
        },
        choosePrice: function(price) {
            this.priceChoose = price;
        },
        deposit: function() {
            let data = {
                amount: this.priceChoose,
                code: this.paymentChoose.code,
                url: window.location.origin
            }
            this.disabledSubmit = true;
            this.$http.post('transactions/recharge', data)
            .then(response => {
                let data = response.data;
                this.$toastr('success', data.message);
                if(data.redirect_url) {
                    window.location.href = data.redirect_url;
                }
            })
            .catch(response => {
                this.disabledSubmit = false;
                this.$toastr('error', response.data.message);
            })
        }
    },
};
</script>