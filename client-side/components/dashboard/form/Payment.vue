<template>
    <div class="card">
        <div class="card-body">
            <h4 class="card-title">Sửa</h4>
            <p class="card-description">
                Thanh toán
            </p>
            <hr>
            <div class="row mt-2">
                <div class="col-6">
                    <label>Vị trí:</label>
                    <select class="form-control" v-model="paymentDt.position">
                        <option v-for="i in total">{{ i }}</option>
                    </select>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-6">
                    <label>Tên (*):</label>
                    <input type="text" class="form-control" placeholder="Tên" v-model="paymentDt.title">
                    <template v-if="globalObjectLength(errors) && errors.title">
                        <template v-for="error in errors.title">
                            <div class="text-danger mt-2">
                                {{ error }}
                            </div>
                        </template>
                    </template>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-6">
                    <label>Logo:</label>
                    <img class="d-flex" v-if="paymentDt.image" :src="globalImageUrl(paymentDt.image ? paymentDt.image : 'images-asset/No_Image_Available.jpg')" width="550">
                    <UploadFile :name="`paymentDt.image_str`" @onChangeFile="changeImage" />
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-6">
                    <label>Mô tả:</label>
                    <CkEditor :name="`paymentDt.content`" :model="paymentDt.content" @changeContent="changeContent" />
                </div>
            </div>
            <div class="mt-3">
                <label>Cài đặt phụ:</label>
                <template v-for="(meta, index) in paymentDt.payment_metas">
                    <div class="row mt-2">
                        <div class="form-group col-5">
                            <input type="text" class="form-control" placeholder="Key" v-model="meta.key">
                        </div>
                        <div class="form-group col-5">
                            <input type="text" class="form-control" placeholder="Giá trị" v-model="meta.value">
                        </div>
                        <div class="form-group col-2">
                            <button class="btn btn-danger mt-2" type="button" @click="deleteMeta(index)">
                                <i class="mdi mdi-delete"></i>
                            </button>
                        </div>
                    </div>
                </template>
                <button class="d-flex btn btn-success mb-4" @click="addMeta()">+ Thêm</button>
            </div>
            <button type="button" class="btn btn-success mt-2" @click="submitForm" :disabled="disabledSubmit">
                <span v-if="disabledSubmit">
                    <PulseLoader :color="'white'" :size="'10px'"/>
                </span>
                <span v-else>
                   Cập nhật
                </span>
            </button>
        </div>
    </div>
</template>
<script type="text/javascript">
import UploadFile from '~/components/common/UploadFile.vue';
import CkEditor from '../ckeditor/CkEditor.vue';
import SocketService from '~/services/socket.service';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

export default {
    components: {
        UploadFile,
        CkEditor,
        PulseLoader
    },
    props: {
        payment: '',
    },
    data() {
        return {
            paymentDt: this.payment,
            total: this.payment.total,
            errors: {},
            disabledSubmit: false,
        }
    },
    methods: {
        changeImage: function(data){
            let index = data.name.split('.');
            this[index[0]][index[1]] = data.base64String;
        },
        changeContent: function(data){
            let index = data.name.split('.');
            this[index[0]][index[1]] = data.content;
        },
        submitForm: function() {
            this.disabledSubmit = true;
            this.errors = {};
            this.$http.post('payments/edit/' + this.$route.params.id, this.paymentDt)
            .then(response => {
                if(this.$route.query.return){
                    this.$router.push({ name: 'dashboard-settings-payments', query: { page: this.$route.query.return } });
                }else{
                    this.$router.push({ name: 'dashboard-settings-payments' });    
                }
                this.$toastr('success', response.data.message);
            })
            .catch(response => {
                this.disabledSubmit = false;
                if(response.status == 400){
                    this.errors = response.data.errors;
                    this.$toastr('error', 'Có lỗi trong quá trình xử lí dữ liệu');
                }else{
                    this.$router.push({ name: 'dashboard-settings-payments' });
                    this.$toastr('error', response.data.message);
                }
            });
        },
        addMeta: function(){
            this.paymentDt.payment_metas.push({ key: '', value: '' });
        },
        deleteMeta: function(index) {
            this.paymentDt.payment_metas.splice(index, 1);
        },
    },
}
</script>

