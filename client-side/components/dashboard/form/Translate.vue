<template>
    <div class="card" v-if="translate">
        <div class="card-body">
            <h4 class="card-title">{{ $route.params.id ?  'Sửa': 'Tạo mới' }}</h4>
            <p class="card-description">
                <template v-if="$store.state.subIsActive == 'pronoun'">Phiên âm</template>
                <template v-else-if="$store.state.subIsActive == 'full_line'">Dịch cả câu</template>
                <template v-else-if="$store.state.subIsActive == 'word'">Dịch từng từ</template>
            </p>
            <hr>
            <div class="forms-sample mt-2">
                <div class="form-group col-6" v-if="lang_trans">
                    <label>Chọn ngôn ngữ gốc (*):</label>
                    <v-select
                        placeholder="Chọn ngôn ngữ gốc"
                        label="title"
                        track-by="title"
                        v-model="translateDt.lang_trans"
                        :options="lang_trans" 
                        :multiple="false" 
                    >
                    </v-select>
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, id) in errors[`lang_trans`]">
                            <div :key="id" class="text-danger mt-2">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <div class="form-group col-6" v-if="trans_lang">
                    <label>Chọn ngôn ngữ dịch (*):</label>
                    <v-select
                        placeholder="Chọn ngôn ngữ dịch"
                        label="title"
                        track-by="title"
                        v-model="translateDt.trans_lang"
                        :options="trans_lang" 
                        :multiple="false" 
                    >
                    </v-select>
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, id) in errors[`trans_lang`]">
                            <div :key="id" class="text-danger mt-2">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <div class="form-group col-6">
                    <label>Từ vựng <template>(*)</template>:</label>
                    <input type="text" class="form-control" placeholder="Từ vựng" v-model="translateDt.words">
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, id) in errors[`words`]">
                            <div :key="id" class="text-danger mt-2">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <div class="form-group col-6">
                    <template v-if="$store.state.subIsActive == 'pronoun'">
                        <label>Phiên âm <template>(*)</template>:</label>
                        <input type="text" class="form-control" placeholder="Phiên âm" v-model="translateDt.translate">
                    </template>
                    <template v-else-if="$store.state.subIsActive == 'full_line' || $store.state.subIsActive == 'word'">
                        <label>Phiên dịch <template>(*)</template>:</label>
                        <input type="text" class="form-control" placeholder="Phiên dịch" v-model="translateDt.translate">
                    </template>
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, id) in errors[`translate`]">
                            <div :key="id" class="text-danger mt-2">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <div class="form-group col-6">
                    <label>Mô tả:</label>
                    <textarea class="form-control" v-model="translateDt.description"></textarea>
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
        translate: '',
    },
    data() {
        return {
            translateDt: this.translate,
            errors: {},
            disabledSubmit: false,
            lang_trans: [],
            trans_lang: [],
        }
    },
    created() {
        this.initLanguage();
    },
    methods: {
        submitForm: function() {
            this.disabledSubmit = true;
            this.errors = {};
            let type = "";
            if(this.$store.state.subIsActive == "pronoun"){
                type = "pronoun";
            }else if(this.$store.state.subIsActive == "full_line"){
                type = "full_line";
            }else if(this.$store.state.subIsActive == "word"){
                type = "word";
            }
            this.$http.post(this.$route.params.id ? 'translate/update/' + this.$route.params.id + '?type=' + type : 'translate/create?type=' + type, this.translateDt)
            .then( response => {
                if(this.$store.state.subIsActive == "pronoun"){
                    this.$router.push({ name: 'dashboard-pronoun', query: { page: this.$route.query.return } });
                }else if(this.$store.state.subIsActive == "full_line"){
                    this.$router.push({ name: 'dashboard-full-line', query: { page: this.$route.query.return } });
                }else if(this.$store.state.subIsActive == "word"){
                    this.$router.push({ name: 'dashboard-words', query: { page: this.$route.query.return } });
                }
                
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
                this.lang_trans = response.data.data;
                this.trans_lang = response.data.data;
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