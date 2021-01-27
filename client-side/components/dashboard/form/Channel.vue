<template>
    <div class="card" v-if="channel">
        <div class="card-body">
            <h4 class="card-title">{{ $route.params.id ?  'Sửa': 'Tạo mới' }}</h4>
            <p class="card-description">
                Channel
            </p>
            <hr>
            <div class="forms-sample mt-2">
                <div class="form-group col-6" v-if="$route.params.id">
                    <label>Trạng thái Channel:</label>
                    <select class="form-control" v-model="chanelData.status" >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                    </select>
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, id) in errors[`status`]">
                            <div :key="id" class="text-danger mt-2">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <div class="form-group col-6" v-if="$route.params.id">
                    <label>Trạng thái subcribe channel:</label>
                    <select class="form-control" v-model="chanelData.statusSub" >
                        <option value="show">Hiển thị</option>
                        <option value="hide">Ẩn</option>
                    </select>
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, id) in errors[`statusSub`]">
                            <div :key="id" class="text-danger mt-2">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <div class="form-group col-6">
                    <label>Tên channel <template>(*)</template>:</label>
                    <input type="text" class="form-control" placeholder="Tên channel" v-model="chanelData.title">
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, id) in errors[`title`]">
                            <div :key="id" class="text-danger mt-2">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <div class="form-group col-6">
                    <label>Avatar channel:</label>
                    <img class="d-flex" v-if="$route.params.id && chanelData.avatar" :src="globalImageUrl(chanelData.avatar)" width="120">
                    <UploadFile :name="`chanelData.avatarStr`" @onChangeFile="changeImage"/>
                </div>
                <div class="form-group col-6">
                    <label>Banner channel:</label>
                    <img class="d-flex" v-if="$route.params.id && chanelData.banner" :src="globalImageUrl(chanelData.banner)" width="550">
                    <UploadFile :name="`chanelData.bannerStr`" @onChangeFile="changeImage"/>
                </div>
                <div class="form-group col-6">
                    <label>Mô tả channel:</label>
                    <CkEditor :name="`chanelData.description`" :model="chanelData.description" @changeContent="changeContent" />
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
        channel: '',
    },
    data() {
        return {
            chanelData: this.channel,
            errors: {},
            disabledSubmit: false,
        }
    },
    created() {
    },
    methods: {
        submitForm: function() {
            this.disabledSubmit = true;
            this.errors = {};
            this.$http.post(this.$route.params.id ? 'channel/update/'+ this.$route.params.id : 'channel/create', this.chanelData)
            .then( response => {
                this.$router.push({ name: 'dashboard-channel', query: { page: this.$route.query.return } });
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