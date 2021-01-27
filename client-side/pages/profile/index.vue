<template>
    <section class="gl-profileUser container-fluid gl-padding-content px-sm-5">
        <div class="gl-profileUser__form mx-auto border-radius-10 pt-4 pb-5">
            <h1 class="font-24 font-md-30 font-weight-bold mb-4 text-center text-uppercase">Chỉnh sửa thông tin</h1>
            <div class="row">
                <div class="upload-avatar col-12 col-md-4">
                    <div class="img text-center cursor-pointer">
                        <img :src="globalImageUrl($store.state.user.data.avatar ? $store.state.user.data.avatar : 'images-asset/No_Image_Available.jpg')" class="rounded-circle" >
                    </div>
                    <div class="text-center cursor-pointer mt-2" @click="handleClickUploadFile">
                        <i class="fas fa-upload mr-1"></i>
                        <span class="text-uppercase font-16 font-md-18 font-weight-bold mb-0">Upload</span>
                        <UploadFile :id="fileInput" :name="`profile.avatarStr`" @onChangeFile="changeImage" :key="avatarKey"/>
                    </div>
                </div>
                <div class="col-12 col-md-8 mt-3 mt-md-0">
                    <div class="info form-input px-sm-5">
                        <div class="user">
                            <div class="d-flex align-items-center">
                                <i class="fa-user fas pr-2"></i>
                                <h4 class="font-openSans font-14 font-md-16 mb-0">Tên người dùng</h4>
                            </div>
                            <input class="border-0 border-radius-10 font-openSans font-14 font-md-16 w-100 mt-2 py-2 pl-4" type="text" v-model="profile.username" :placeholder="profile.username" autocomplete="off"/>
                            <template v-if="globalObjectLength(errors)">
                                <template v-for="(error, id) in errors[`username`]">
                                    <div :key="id" class="text-danger d-flex mt-2">{{ error }}</div>
                                </template>
                            </template>
                        </div>
                        <div class="email mt-4">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-envelope pr-2"></i>
                                <h4 class="font-openSans font-14 font-md-16 mb-0">Email đăng nhập</h4>
                            </div>
                            <input class="border-0 border-radius-10 font-openSans font-14 font-md-16 w-100 mt-2 py-2 pl-4" type="text" :placeholder="profile.email" disabled autocomplete="off"/>
                        </div>
                        <div class="phone mt-4">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-phone pr-2"></i>
                                <h4 class="font-openSans font-14 font-md-16 mb-0">Điện thoại</h4>
                            </div>
                            <input class="border-0 border-radius-10 font-openSans font-14 font-md-16 w-100 mt-2 py-2 pl-4" type="text" v-model="profile.phone" :placeholder="profile.phone" autocomplete="off"/>
                        </div>
                    </div>
                    <div class="change-pass px-sm-5 mt-4">
                        <div class="bg-danger border-radius-10 d-inline-block font-14 font-md-16 pl-5 pr-3 py-2 text-white" id="dropp-bg">
                            <span class="text-uppercase font-14 font-md-16">Đổi mật khẩu</span>
                            <span @click.self="showHidePass('dropp-pass', 'dropp-icon', 'dropp-bg')" 
                            id="dropp-icon" class="fas fa-chevron-up cursor-pointer pl-5"></span>
                        </div>
                        <div class="show-pass form-input d-none" id="dropp-pass">
                            <div class="pass mt-4">
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-key pr-2"></i>
                                    <h4 class="font-14 font-openSans font-md-16 mb-0">Mật khẩu hiện tại</h4>
                                </div>
                                <input class="border-0 border-radius-10 font-14 font-md-16 w-100 mt-2 py-2 pl-4" type="password" v-model="profile.current_psw" autocomplete="off"/>
                                <template v-if="globalObjectLength(errors)">
                                    <template v-for="(error, id) in errors[`current_psw`]">
                                        <div :key="id" class="text-danger d-flex mt-2">{{ error }}</div>
                                    </template>
                                </template>
                            </div>
                            <div class="pass mt-4">
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-key pr-2"></i>
                                    <h4 class="font-openSans font-14 font-md-16 mb-0">Mật khẩu mới</h4>
                                </div>
                                <input class="border-0 border-radius-10 font-openSans font-14 font-md-16 w-100 mt-2 py-2 pl-4" type="password" v-model="profile.new_psw" autocomplete="off"/>
                                <template v-if="globalObjectLength(errors)">
                                    <template v-for="(error, id) in errors[`new_psw`]">
                                        <div :key="id" class="text-danger d-flex mt-2">{{ error }}</div>
                                    </template>
                                </template>
                            </div>
                            <div class="enter-pass mt-4">
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-key pr-2"></i>
                                    <h4 class="font-openSans font-14 font-md-16 mb-0">Nhập lại mật khẩu mới</h4>
                                </div>
                                <input class="border-0 font-openSans border-radius-10 w-100 mt-2 py-2 pl-4 " type="password" v-model="profile.confirm_psw" autocomplete="off"/>
                                <template v-if="globalObjectLength(errors)">
                                    <template v-for="(error, id) in errors[`confirm_psw`]">
                                        <div :key="id" class="text-danger d-flex mt-2">{{ error }}</div>
                                    </template>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <div class="btn-update text-center mt-4 px-sm-5 px-md-0">
                        <button type="submit" @click="submitProfile" :disabled="disabledSubmit" class="btn-upload font-16 font-md-18 py-2 w-100 w-md-50">Cập nhật</button>
                    </div>
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
            avatarKey: 0,
            profile: {
                email: this.$store.state.user.data.email,
                username: this.$store.state.user.data.username,
                phone: this.$store.state.user.data.phone,
                current_psw: '',
                new_psw: '',
                confirm_psw: '',
                avatarStr: '',
                isChangePsw: false,
            }
        }
    },
    created() {
        this.$store.dispatch('user/authentication', { url: '', route: this.$route });
    },
    methods: {
        handleClickUploadFile() {
            document.getElementById('fileInput').click();
        },
        showHidePass: function (drop_id, icon_id, bg_id) { 
            (function showDropPass() {
                let element = document.getElementById(drop_id);
                if (element) {
                    if (element.classList.contains("d-block")) {
                        this.profile.isChangePsw = false;
                        element.classList.add("d-none");
                        element.classList.remove("d-block");
                    } else if (element.classList.contains("d-none")) {
                        this.profile.isChangePsw = true;
                        element.classList.add("d-block");
                        element.classList.remove("d-none");
                    }
                }
            }.bind(this))();
            (function showDropIcon() {
                let element = document.getElementById(icon_id);
                if (element) {
                    if (element.classList.contains("fa-chevron-up")) {
                        element.classList.add("fa-chevron-down");
                        element.classList.remove("fa-chevron-up");
                    } else if (element.classList.contains("fa-chevron-down")) {
                        element.classList.add("fa-chevron-up");
                        element.classList.remove("fa-chevron-down");
                    }
                }
            })();
            (function toggleBackGround() {
                let element = document.getElementById(bg_id);
                if (element) {
                    if (element.classList.contains("bg-danger")) {
                        element.classList.add("bg-dark");
                        element.classList.remove("bg-danger");
                    } else if (element.classList.contains("bg-dark")) {
                        element.classList.add("bg-danger");
                        element.classList.remove("bg-dark");
                    }
                }
            })();
        },
        submitProfile: function(){
            this.disabledSubmit = true;
            this.errors = {};
            let data = this.profile;
            this.$http.post('/user/update', data)
            .then( response => {
                this.$toastr('success', response.data.message);
                AuthService.setAccessToken(response.data.token);
                this.$store.commit('user/set', AuthService.setUser());
                this.disabledSubmit = false;
                let element = document.getElementById("dropp-pass");
                if (element) {
                    this.profile.isChangePsw = false;
                    element.classList.add("d-none");
                    element.classList.remove("d-block");
                }
                this.profile.current_psw = '';
                this.profile.new_psw = '';
                this.profile.confirm_psw = '';
                this.avatarKey++;
            })
            .catch( response => {
                this.disabledSubmit = false;
                if(response.status == 400){
                    this.errors = response.data.errors;
                    this.$toastr('error', 'Có lỗi trong quá trình xử lí dữ liệu');
                }
            })

        },
        changeImage: function(data) {
            let index = data.name.split('.');
            this[index[0]][index[1]] = data.base64String
        },
    },
};
</script>