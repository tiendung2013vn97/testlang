<template>
    <div class="card" v-if="category">
        <div class="card-body">
            <h4 class="card-title">{{ $route.params.id ?  'Sửa': 'Tạo mới' }}</h4>
            <p class="card-description">
                Danh mục
            </p>
            <hr>
            <div class="forms-sample mt-2">
                <div class="form-group col-6">
                    <label>Tên <template>(*)</template>:</label>
                    <input type="text" class="form-control" placeholder="Tiêu đề" v-model="categoryDt.title">
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, id) in errors[`title`]">
                            <div :key="id" class="text-danger mt-2">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <div class="form-group col-6">
                    <label>Icon:</label>
                    <img class="d-flex" v-if="$route.params.id && categoryDt.icon" :src="globalImageUrl(categoryDt.icon)" width="550">
                    <UploadFile :name="`categoryDt.iconStr`" @onChangeFile="changeImage"/>
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

export default {
    components: {
        PulseLoader,
        UploadFile,
    },
    props: {
        category: '',
    },
    data() {
        return {
            categoryDt: this.category,
            errors: {},
            disabledSubmit: false,
        }
    },
    methods: {
        submitForm: function() {
            this.disabledSubmit = true;
            this.errors = {};
            this.$http.post(this.$route.params.id ? 'categories/edit/'+ this.$route.params.id : 'categories/create', this.categoryDt)
            .then( response => {
                this.$router.push({ name: 'dashboard-categories', query: { page: this.$route.query.return } });
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
        }
    },
}

</script>