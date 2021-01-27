<template>
    <div class="card" v-if="pages">
        <div class="card-body">
            <h4 class="card-title">{{ $route.params.id ?  'Sửa': 'Tạo mới' }}</h4>
            <p class="card-description">
                Trang bài viết
            </p>
            <hr>
            <div class="forms-sample mt-2">
                <div class="form-group col-6">
                    <label>Tiêu đề <template>(*)</template>:</label>
                    <input type="text" class="form-control" placeholder="Tiêu đề" v-model="pageDt.title">
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, id) in errors[`title`]">
                            <div :key="id" class="text-danger mt-2">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <div class="form-group col-6">
                    <label>Nội dung <template>(*)</template>:</label>
                    <CkEditor :name="`pageDt.content`" :model="pageDt.content" @changeContent="changeContent" />
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, id) in errors[`content`]">
                            <div :key="id" class="text-danger mt-2">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <div class="form-group col-6">
                    <label>SEO tiêu đề:</label>
                    <input type="text" class="form-control" placeholder="SEO tiêu đề" v-model="pageDt.seo_title">
                </div>
                <div class="form-group col-6">
                    <label>SEO nội dung:</label>
                    <textarea class="form-control" v-model="pageDt.seo_content"></textarea>
                </div>
                <div class="form-group col-6">
                    <label>SEO từ khóa:</label>
                    <input type="text" class="form-control" placeholder="SEO tiêu đề" v-model="pageDt.seo_keywords">
                </div>
                <div class="form-group col-6">
                    <label>SEO hình ảnh:</label>
                    <img class="d-flex" v-if="$route.params.id && pageDt.seo_image" :src="globalImageUrl(pageDt.seo_image)" width="550">
                    <UploadFile :name="`pageDt.seo_imageStr`" @onChangeFile="changeImage"/>
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
        pages: '',
    },
    data() {
        return {
            pageDt: this.pages,
            errors: {},
            disabledSubmit: false,
        }
    },
    methods: {
        submitForm: function() {
            this.disabledSubmit = true;
            this.errors = {};
            this.$http.post(this.$route.params.id ? 'pages/update/'+ this.$route.params.id : 'pages/create', this.pageDt)
            .then( response => {
                this.$router.push({ name: 'dashboard-pages', query: { page: this.$route.query.return } });
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