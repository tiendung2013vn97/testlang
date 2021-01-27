<template>
    <div class="card" v-if="pronoun">
        <div class="card-body">
            <h4 class="card-title">{{ $route.params.id ?  'Sửa': 'Tạo mới' }}</h4>
            <p class="card-description">
                Phiên âm
            </p>
            <hr>
            <div class="forms-sample mt-2">
                <div class="form-group col-6" v-if="lang">
                    <label>Chọn ngôn ngữ (*):</label>
                    <v-select
                        placeholder="Chọn ngôn ngữ"
                        label="title"
                        track-by="title"
                        v-model="pronounDt.lang"
                        :options="lang" 
                        :multiple="false" 
                    >
                    </v-select>
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, id) in errors[`lang`]">
                            <div :key="id" class="text-danger mt-2">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <div class="form-group col-6">
                    <label>Từ vựng <template>(*)</template>:</label>
                    <input type="text" class="form-control" placeholder="Từ vựng" v-model="pronounDt.raw">
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, id) in errors[`raw`]">
                            <div :key="id" class="text-danger mt-2">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <div class="form-group col-6">
                    <label>Phiên âm <template>(*)</template>:</label>
                    <input type="text" class="form-control" placeholder="Phiên âm" v-model="pronounDt.pronoun">
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, id) in errors[`pronoun`]">
                            <div :key="id" class="text-danger mt-2">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <div class="form-group col-6">
                    <label>Mô tả:</label>
                    <textarea class="form-control" v-model="pronounDt.description"></textarea>
                </div>
            </div>
            <button type="button" class="btn btn-success ml-2 mt-2 pd-2" @click="submitForm" :disabled="disabledSubmit">
                <span v-if="disabledSubmit">
                    <PulseLoader :color="'white'" :size="'10px'"/>
                </span>
                <span v-else>
                    {{ $route.params.id ? 'Cập nhật' : 'Tạo' }}
                </span>
            </button>
        </div>
    </div>
</template>
<script type="text/javascript">
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import UploadFile from '~/components/common/UploadFile.vue';
import CkEditor from '~/components/dashboard/ckeditor/CkEditor.vue';

export default {
    components: {
        PulseLoader,
        UploadFile,
        CkEditor,
    },
    props: {
        pronoun: '',
    },
    data() {
        return {
            pronounDt: this.pronoun,
            errors: {},
            disabledSubmit: false,
            lang: [],
        }
    },
    created() {
        this.initLanguage();
    },
    methods: {
        submitForm: function() {
            this.disabledSubmit = true;
            this.errors = {};
            this.$http.post(this.$route.params.id ? 'translate/update/'+ this.$route.params.id : 'translate/create', this.pronounDt)
            .then( response => {
                this.$router.push({ name: 'dashboard-pronoun', query: { page: this.$route.query.return } });
                this.$toastr('success', response.data.message);
            })
            .catch( response => {
                this.disabledSubmit = false;
                if(response.status == 400){
                    this.errors = response.data.errors;
                    this.$toastr('error', 'Có lỗi trong quá trình xử lí dữ liệu');
                }else{
                    this.$toastr('error', response.data.message);
                }
            });
        },
        initLanguage: function() {
            this.$http.get('langs/all')
            .then(response => {
                this.lang = response.data.data;
            })
        },
        changeImage: function(data) {
            let index = data.name.split('.');
            this[index[0]][index[1]] = data.base64String
        },
        changeContent: function(data) {
            let index = data.name.split('.');
            this[index[0]][index[1]] = data.content;
        },
    },
}

</script>