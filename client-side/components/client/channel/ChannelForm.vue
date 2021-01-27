<template>
    <div class="mx-auto pb-5 col col-md-10 px-0">
        <div class="d-block mb-3 mt-5 profileUser pt-1" v-if="channel">
            <!-- start : contentRight -->
            <div class="pb-5 mt-3 mt-lg-0 px-2">
                <!-- start : file -->
                <div>
                    <div class="text-center">
                        <h3>{{ $route.params.slug ?  'Sửa channel': 'Tạo mới channel' }}</h3>
                        <div>Thông tin cơ bản như tên và ảnh của bạn, mà bạn sử dụng trên các dịch vụ của Langadvisor</div>
                    </div>
                    <div class="border-s1 border-color-ba border-radius-5 pt-1 pb-3 mt-4">
                        <div class="font-size-24 font-weight-500 mx-md-5 px-2 px-md-0">Hồ sơ</div>
                        <div class="d-xl-flex d-block mx-md-5 px-2 px-md-0">
                            <div>Một số thông tin có thể hiển thị cho những người khác đang sử dụng dịch vụ của Langadvisor. <nuxt-link to="#">Tìm hiểu thêm</nuxt-link></div>
                                
                        </div>
                        <!-- image -->
                        <div class="py-2 pr-md-4 px-2 pl-md-0 mt-1">
                            <div class="d-md-flex d-block align-items-center mx-md-5">
                                <div class="col-md-3 col-12 pl-0 pr-md-2 px-0">Ảnh đại diện</div>
                                <div class="d-md-flex mt-2 mt-md-0 col-12 col-md-9 pl-0 align-items-center">
                                    <div>
                                        <UploadFile :name="'channelDt.avatarStr'" @onChangeFile="changeImage" :key="avatarKey"/>
                                    </div>
                                    <div class="h-70 mx-auto my-2 w-70">
                                        <img class="w-100 h-100" v-if="$route.params.slug && channelDt.avatar" :src="globalImageUrl(channelDt.avatar)">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="py-2 pr-md-4 px-2 pl-md-0 mt-1">
                            <div class="d-md-flex d-block align-items-center mx-md-5">
                                <div class="col-md-3 col-12 pr-md-2 px-0">Banner</div>
                                <div class="d-md-flex mt-2 mt-md-0 col-12 col-md-9 pl-0 align-items-center">
                                    <div>
                                        <UploadFile :name="'channelDt.bannerStr'" @onChangeFile="changeBanner" :key="bannerKey"/>
                                    </div>
                                    <div class="gl-img-boder-radius-0 mx-auto my-2 text-center">
                                        <img class="w-100 h-100" v-if="$route.params.slug && channelDt.banner" :src="globalImageUrl(channelDt.banner)">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- status sub -->
                        <div class="py-2 pr-md-4 px-2 pl-md-0 mt-1">
                            <div class="d-md-flex d-block mx-md-5">
                                <div class="col-md-3 col-12 pr-md-2 px-0">Trạng thái subcribe channel</div>
                                <div class="col-12 col-md-9 pr-md-2 px-0 align-items-center">
                                    <select class="form-control" v-model="channelDt.statusSub" >
                                        <option value="show">Hiển thị</option>
                                        <option value="hide">Ẩn</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Name -->
                        <div class="py-2 pr-md-4 px-2 pl-md-0 mt-1">
                            <div class="d-md-flex d-block mx-md-5">
                                <div class="col-md-3 col-12 pr-md-2 px-0">Tên channel</div>
                                <div class="col-12 col-md-9 pr-md-2 px-0 align-items-center">
                                    <input type="text" class="form-control" id="inputTitleChannel" v-model="channelDt.title" aria-describedby="usernameHelp" placeholder="Nhập tên channel" autocomplete="off"/>
                                    <template v-if="globalObjectLength(errors)">
                                        <template v-for="(error, id) in errors[`title`]">
                                            <div :key="id" class="text-danger d-flex mt-2">{{ error }}</div>
                                        </template>
                                    </template>
                                </div>
                            </div>
                        </div>

                        <div class="py-2 pr-md-4 px-2 pl-md-0 mt-1">
                            <div class="d-md-flex d-block mx-md-5">
                                <div class="col-md-3 col-12 pr-md-2 px-0">Mô tả về channel</div>
                                <div class="col-12 col-md-9 pr-md-2 px-0 align-items-center">
                                    <textarea class="form-control" placeholder="Mô tả về channel..." rows="3" v-model="channelDt.description"></textarea>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <!-- end : file -->
            </div>
            <!-- end : contentRight -->
        </div>
         <!-- start : bottom -->
        <div class="d-block d-md-flex editButton justify-content-between pb-5 px-2">
            <button type="submit" @click="submitForm" :disabled="disabledSubmit" class="btn btn-success px-5">
                <span v-if="disabledSubmit">
                    <PulseLoader :color="'white'" :size="'10px'"/>
                </span>
                <span v-else>
                    {{ $route.params.slug ? 'Cập nhật' : 'Tạo' }}
                </span>
            </button>
        </div>
        <!-- end : bottom -->
    </div>
</template>

<script type="text/javascript">
import UploadFile from '~/components/common/UploadFile.vue';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import AuthService from '~/services/auth.service';

export default {
    components: {
        PulseLoader,
        UploadFile,
    },
    props: {
        channel: '',
    },
    data() {
        return {
            channelDt: this.channel,
            disabledSubmit: false,
            errors: {},
            avatarKey: 0,
            bannerKey: 0,
        }
    },
    methods: {
        submitForm: function(){
            this.disabledSubmit = true; 
            this.errors = {};
            this.$http.post(this.$route.params.slug ? 'channel/update-channel-user/'+ this.channelDt.slug : 'channel/create', this.channel)
            .then( response => {
                this.disabledSubmit = false;
                this.channelDt = response.data.channel;
                this.$toastr('success', response.data.message);
                this.$router.push({ name: 'channel-slug', params: { slug: this.channelDt.slug }});
            })
            .catch( response => {
                this.disabledSubmit = false;
                this.errors = response.data.errors;
                if(response.status == 404 || response.status == 403){
                    this.$toastr('error', response.data.message);
                }else{
                    this.$toastr('error', 'Có lỗi trong quá trình xử lí dữ liệu');
                }
            })

        },
        changeImage: function(data) {
            let index = data.name.split('.');  
            this[index[0]][index[1]] = data.base64String
        },
        changeBanner: function(data) {
            let index = data.name.split('.');
            this[index[0]][index[1]] = data.base64String
        },
    },
}
</script>