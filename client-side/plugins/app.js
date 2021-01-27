import Vue from "vue";
import httpPlugin from "./http";
import FBSignInButton from "vue-facebook-signin-button";
import VueToastr from "@deveodk/vue-toastr";
import vSelect from "vue-select";
import GoogleSignInButton from "./google-signin-button";
import VueSession from "vue-session";
import VueDropzone from "vue2-dropzone";
import Slick from "vue-slick";
import "vue2-dropzone/dist/vue2Dropzone.min.css";
import "video.js/dist/video-js.min.css";
import "videojs-youtube/dist/Youtube.min.js";
import DatePicker from 'vue2-datepicker';
import GSignInButton from 'vue-google-signin-button'
// import GoogleLogin from 'vue-google-login';

Vue.component("DatePicker", DatePicker);
// Vue.use(GoogleSignInButton);
Vue.component("v-select", vSelect);
Vue.component("VueDropzone", VueDropzone);
Vue.component("Slick", Slick);
Vue.use(httpPlugin);
Vue.use(FBSignInButton);
// Vue.use(GoogleLogin)
Vue.use(VueToastr, {
    defaultPosition: "toast-top-right",
    defaultType: "success",
    defaultTimeout: 3000
});
Vue.use(VueSession);



/**
 * Every functions here must have 'global' prefix
 */
import mixin from './mixin';

Vue.mixin(mixin);
