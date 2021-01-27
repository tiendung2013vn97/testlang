<template>
    <div :class="!uploadForm ? 'd-lg-flex' : ''" class="py-2 gl-video-detail__container" >       
        <div :class="!uploadForm ? 'col-lg-8 px-0 mb-2 mb-lg-0' : 'col-lg-6 gl-sub-video__video px-0'" class="gl-video-detail__video" id="video">
            <video ref="videoPlayer" id="gl_video_js" class="gl-video-height video-js vjs-default-skin w-100" >
            </video>
            
            <div v-if="!switchIn" :class=" ['pos-out gl-controls-bar d-flex justify-content-center space']">
            </div>
            <div id="gl_sub_top" :class="isShowSub && sub_show.raw_mean.default.length ? [switchIn?'top':'pos-out','gl-controls-bar d-flex justify-content-center pt-3 pb-3'] : ''" >
                {{ isShowSub && sub_show.exact_mean.length ? sub_show.exact_mean : '' }}
            </div>
            
            <!-- <div v-if="isShowSub && globalObjectLength(sub_show.raw_mean.default)"  id="gl_sub_bottom" :class="isShowSub && globalObjectLength(sub_show.raw_mean.default) ? [switchIn?'bottom':'pos-out','gl-controls-bar d-flex justify-content-center'] : ''">
                <div class="gl-controls-bar_sub px-2" v-for="(i, index) in sub_show.raw_mean.default.length" :key="index">
                    <div class="gl-controls-bar__default-sub text-center mb-2">
                        <span class="gl-controls-bar__default-sub__note">
                            <span class="">{{ sub_show.raw_mean.default[i - 1] }}</span>
                        </span>
                    </div>
                    <div class="gl-controls-bar__custom-sub text-center mb-2">
                        <span class="gl-controls-bar__default-sub__note">
                            <span class="">{{ sub_show.raw_mean.trans[i - 1] }}</span>
                        </span>
                    </div>
                    <div class="gl-controls-bar__default-sub text-center mb-2">
                        <span class="gl-controls-bar__default-sub__note">
                            <span class="">{{ sub_show.pronunciation[i - 1] }}</span>
                        </span>
                    </div>
                </div>
            </div> -->

            <div id="gl_sub_bottom" :class="isShowSub && sub_show.raw_mean.default.length ? [switchIn?'bottom':'pos-out','gl-controls-bar d-flex justify-content-center', isFullScreen?'bottom-50px':''] : ''">
                <div class="gl-controls-bar_sub px-2" v-for="(i, index) in sub_show.raw_mean.default.length" :key="index">
                    <div class="gl-controls-bar__default-sub text-center mb-2">
                        <span class="gl-controls-bar__default-sub__note">
                            <span class="">{{ sub_show.raw_mean.default[i - 1] }}</span>
                        </span>
                    </div>
                    <div class="gl-controls-bar__custom-sub text-center mb-2">
                        <span class="gl-controls-bar__default-sub__note">
                            <span class="">{{ sub_show.raw_mean.trans[i - 1] }}</span>
                        </span>
                    </div>
                    <div class="gl-controls-bar__default-sub text-center mb-2">
                        <span class="gl-controls-bar__default-sub__note">
                            <span class="">{{ sub_show.pronunciation[i - 1] }}</span>
                        </span>
                    </div>
                </div>
            </div>

            <!--Custom player control bar -->
            <div :class="[switchIn?'':'pos-out',isFullScreen?'pos-fullscreen':'pos-normal','gl-controls-bar custom-controls-bar d-flex']"  id="gl_cus_bar" >
                <button type="button" class="btn" @click="playVideo()">
                    <i class="far p-2 rounded-circle" :class="isPlay ? 'fa-pause' : 'fa-play'"></i>
                </button>
                <button type="button" class="btn" @click="actionSub('pre')">
                    <i class="far fa-chevron-double-left p-2 rounded-circle"></i>
                </button>
                <button type="button" class="btn" @click="actionSub('next')">
                    <i class="far fa-chevron-double-right p-2 rounded-circle"></i>
                </button>
                <div class="d-flex align-items-center gl-controls-bar__timer p-2 text-center">
                    <span class="text-white ">
                        <template v-if="player && currentTime > 0 && video.duration">
                            {{ displayCurStartTime }} <template v-if="screenWidth >= 768">-</template> {{ displayCurEndTime }}
                        </template>
                        <template v-else>
                            00:00 <template v-if="screenWidth >= 768">-</template> 00:00
                        </template>
                    </span>
                </div>
                <div class="d-flex align-items-center gl-controls-bar__time_bar" :class="uploadForm && !isFullScreen ? '' : isFullScreen ? 'col-md-5 col-lg-6 col-xl-8' : 'col-md-5 col-lg-3 col-xl-6'">
                    <input id="timer" type="range" class="range" min="0.001" :max="player ? player.duration() : 100" v-model="currentTime" />
                </div>
                <button type="button" class="btn" :class="uploadForm && screenWidth <= 375 ? 'd-none' : ''" @click="setMuted()">
                    <i class="far p-2 rounded-circle" :class="isMuted || volume <= 0 ? 'fa-volume-mute' : volume <= 0.5 ? 'fa-volume' : 'fa-volume-up'"></i>
                </button>              
                <div class="d-flex align-items-center" :class="screenWidth > 425 ? 'col' : ''">
                    <input id="volume" type="range" class="range" :class="uploadForm && screenWidth <= 375 ? 'd-none' : ''" min="0" max="1" step="0.01" v-model="volume"/>
                </div>
                <button v-if="!isFullScreen" type="button" class="btn" :class="screenWidth <= 375 ? 'd-none' : ''" @click="switchSubPos()">
                    <img v-if="switchIn" :src="imageUrlSwitchOut" class="img-switch d-lg-block h-35 w-70" />
                    <img  v-if="!switchIn" :src="imageUrlSwitchIn" class="img-switch d-lg-block h-35 w-70" />
                </button>
                <button id="btn-setting" type="button" class="btn" :class="screenWidth <= 375 ? 'd-none' : ''" @blur="handleBtnSettingFocusOut">
                    <img :src="imageUrlSetting" class="img-setting d-lg-block " id="img-setting" @click="openSetting"  />
                    <div id="setting-opt">
                        
                        <!-- speed option -->
                        <div id="speed-opt">
                            <span :class="['opt-min-title']">Tốc độ video: </span>
                            <select v-model="tempSetting.speed">
                                <option>0.25</option>
                                <option>0.5</option>
                                <option>0.75</option>
                                <option>1</option>
                                <option>1.25</option>
                                <option>1.5</option>
                                <option>1.75</option>
                                <option>2</option>
                            </select>
                        </div>

                        <!-- resolution option -->
                        <div id="resolution-opt">
                            <span :class="['opt-min-title']">Độ phân giải: </span>
                            <select v-model="tempSetting.resolution">
                                <option>360</option>
                                <option>720</option>
                            </select>
                        </div>

                        <!-- play normal option-->
                        <div id="play-normal-opt">
                            <input type="checkbox" id="input-play-normal-opt" v-model="tempSetting.isNormalPlay" @change="handleNormalPlayOptChange">
                            <span :class="['checkbox-opt-min-title']">Phát bình thường </span>
                        </div>

                        <!-- play all option -->
                        <div id="play-all-opt">
                            <input type="checkbox" id="input-play-all-opt" v-model="tempSetting.isPlayAll" @change="handlePlayAllOptChange">
                            <span :class="['checkbox-opt-min-title']">Phát tất cả, mỗi câu <input type="number" id="input-repeat-number" v-model="tempSetting.repeatNumber" min="1"  @focus="disableKeyEvent" @blur="enableKeyEvent"> lần rồi qua câu tiếp theo</span>
                        </div>

                        <!--repeat single sentence -->
                        <div id="repeat-single-opt">
                            <input type="checkbox" id="input-repeat-single-opt" v-model="tempSetting.isSingleLoop" @change="handleRepeatSingleOptChange">
                            <span :class="['checkbox-opt-min-title']">Phát từng câu lặp lại đến khi nhấn nút qua câu </span>
                        </div>

                        <!--play on range -->
                        <div id="play-on-range-opt">
                            <input type="checkbox" id="input-play-on-range-opt" v-model="tempSetting.isPlayFromRange" @change="handlePlayOnRangeOptChange" :disabled="subs.length==0">
                            <span :class="['checkbox-opt-min-title']">Phát từ câu 
                                <input type="number" id="input-from-sentence" v-model="tempSetting.fromSentence" min="0" @change="checkMaxFromSentence" @focus="disableKeyEvent" @blur="enableKeyEvent">
                                đến câu
                                <input type="number" id="input-to-sentence" v-model="tempSetting.toSentence" min="0"  @change="checkMaxToSentence" @focus="disableKeyEvent" @blur="enableKeyEvent">
                            </span>
                            <span id="gen-range-control">
                                Số câu:
                                <input type="number" id="input-gen-range" v-model="tempSetting.genRange" min="0" @change="handleInputRangeChange"  @focus="disableKeyEvent" @blur="enableKeyEvent">
                                    <span id="btn-gen-range" class="fas fa-arrow-alt-circle-right" @click="updateRange"></span>
                            </span>
                        </div>

                        <!-- auto loop -->
                        <div id="auto-loop-opt">
                            <input type="checkbox" id="input-auto-loop-opt" v-model="tempSetting.autoLoop" @change="handleAutoLoopOptChange">
                            Tự động phát lại
                        </div>

                        <div id="btn-control-setting">
                                <button class="btn btn-primary" @click="changeUserSetting">Lưu</button>
                                <button class="btn btn-primary" @click="cancleUserSettingChange">Hủy</button>
                        </div>
                    </div>
                </button>
                <button type="button" class="btn" @click="fullScreen()">
                    <i class="p-2 rounded-circle" :class="isFullScreen ? 'fal fa-compress' : 'fas fa-expand'"></i>
                </button>
            </div>
        </div>



        <div v-if="!uploadForm" class="col-lg-4 pl-lg-3 col-12 px-0 gl-video-detail__options">
            <div class="sub-list-container" >
                <div class="gl-video-detail__options__content border border-success" id="sub-content" v-on:scroll="handleScroll" @mousewheel="handleMouseWheel">
                    <div 
                        class="items px-2 py-3 border-bottom position-relative" 
                        v-for="(sub, i) in subs"
                        :key="i"
                        @click="proxyPlayToTime(sub.start)" 
                        :class="sub.start && sub_show.start == sub.start ? 'active' : ''"
                        :id="sub.start && sub_show.start == sub.start ? 'sub-active' : ''"
                    >
                        
                        <div v-if="sub.start && sub.end && sub.start <= video.duration && sub.end <= video.duration" >
                            <div class="default-sub mb-1 pl-5">
                                {{ sub.default_mean_display }}
                            </div>
                            <div class="custom-sub  pl-5">
                                    {{ sub.exact_mean}}
                            </div>
                            <div class="position-absolute font-size-12 time px-1 rounded " v-if="sub.start">
                                {{sub.displayTime}}
                            </div>
                            <div class="sub-index">
                                <div class="sub-index-val">
                                {{i}}
                                </div>
                            </div>
                    
                        </div>
                    </div>
                    <template v-if="videos.userPayment == 'no'">
                        <div class="items px-2 py-3 border-bottom position-relative" @click="globalAuthDirect('video-slug', '', $route.query, $route.params), payment()">
                            <div class="default-sub mb-1">
                                Trả phí để xem tiếp... ({{ globalFormatNumber(videos.price, '.') }} đ)
                            </div>
                            <div class="position-absolute font-size-12 time px-1 rounded">
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>


        <div v-if="uploadForm" class="col-md-6 gl-sub-video__video px-0 gl-video-detail__video">
            <div class="d-flex text-danger mt-2" >Giây hiện tại của video: {{ player ? parseFloat(player.currentTime()).toFixed(3) : 0.000 }}</div>
        </div>
    </div>
</template>
<script>
import videojs from 'video.js';
import AuthService from '~/services/auth.service';
import SocketService from '~/services/socket.service';
import Constants from '~/constants'

export default {
    components: {
        AuthService,
        SocketService,
    },
    props: {
        video: '',
        uploadForm: '',
        anyInputFocusOn:false
    },
    data() {
        return {
            player: null,
            isPlay: false,
            isFullScreen: false,
            isMuted: false,
            volume: 1,
            oldVolume: '',
            videoOptions: {
                autoplay: false,
                controls: true,
                techOrder: [
                    'youtube','html5'
                ],
                sources: [
                    // {
                    //     src: this.video.link + '&rel=0',
                    //     type: 'video/youtube'
                    // },
                    // {
                    //     src: this.tempUploadVideo ,
                    //     type: 'video/mp4'
                    // },
                ],
            },
            videos: this.video,
            subs: this.video.subtitles,
            sub_show: {
                start: '',
                end: '',
                full_mean: '',
                default_mean: '',
                // full_mean_display:'',
                default_mean_display:'',
                exact_mean:'',
                raw_mean: {
                    default: [],
                    trans: [],
                },
                pronunciation: [],
            },
            user: this.$store.state.user.data,
            screenWidth: window.screen.width,
            isShowSub: false,
            currentSub: -1,
            currentTime: 0.000,
            checkScroll: false,
            timeScroll: 0,
            switchIn:true,
            defaultSwitchIn:true,
            userSetting:{
                speed:1,
                volume:100,
                autoLoop:false,
                isPlayAll:true,
                toSentence:0,
                fromSentence:0,
                isSingleLoop:false,
                repeatNumber:2,
                isPlayFromRange:false,
                resolution:360,
                genRange:1,
                isNormalPlay:false
            },
            tempSetting:{
                speed:1,
                volume:100,
                autoLoop:false,
                isPlayAll:true,
                toSentence:0,
                fromSentence:0,
                isSingleLoop:false,
                repeatNumber:2,
                isPlayFromRange:false,
                resolution:360,
                genRange:1,
                isNormalPlay:false,
            },
            curNumLoop:1,
            lastCheck:0,
            isVideoReady:false,
            displayCurStartTime:"00:00",
            displayCurEndTime:"00:00",
            imageUrlSwitchOut:"images-asset/switchOut.png",
            imageUrlSwitchIn:"images-asset/switchIn.png",
            imageUrlSetting:"images-asset/setting.png",
            didOpt:false,
            normalPlayLoopedDoneFlag:false,
            lastSubContentWheelTime:0
        }
    },
    created() {

        //TODO: restore comment after fixed
        // if(this.screenWidth > 767) {
        //     this.isShowSub = true;
        // }
        this.isShowSub = true;        
        window.addEventListener("keydown",this.onKeyPress) 
        Object.keys(this).filter(key=>key.startsWith("imageUrl")).forEach(key=>this[key]=`${window.location.origin}/${this[key]}`)
    },    
    updated(){

    },
    destroyed(){
        window.removeEventListener("keydown",this.onKeyPress)
    },
    methods: {
        resetSetting(){          
          this.tempSetting={...this.userSetting}
          if(this.subs.length){
            this.currentSub=-1
            this.currentTime=0
          }
          if(this.tempSetting.toSentence>this.subs.length-1)this.tempSetting.toSentence=this.subs.length-1
          if(this.tempSetting.fromSentence>this.subs.length-1)this.tempSetting.fromSentence=0
          this.changeUserSetting()
        },
        disableKeyEvent(event){
            this.$emit('disableKeyEvent');
        },
        enableKeyEvent(event){
            this.$emit('enableKeyEvent');
        },
        updateRange(){
            let range=+this.tempSetting.genRange
            let from=+this.tempSetting.fromSentence
            if(+this.tempSetting.toSentence-from+1!=range){
                if(+this.tempSetting.fromSentence+range-1<this.subs.length){
                    this.tempSetting.toSentence=+this.tempSetting.fromSentence+range-1
                }else{
                    this.tempSetting.toSentence=this.subs.length
                }
                return
            }

            if(from+range<this.subs.length){
                this.tempSetting.fromSentence=+this.tempSetting.fromSentence+range
                if(+this.tempSetting.toSentence+range<this.subs.length){
                    this.tempSetting.toSentence=+this.tempSetting.toSentence+range
                }else{
                    this.tempSetting.toSentence=this.subs.length
                }
            }
        },
        handleInputRangeChange(event){
            let range=+event.target.value
            if(range<=0) range=1
            this.tempSetting.fromSentence=0
            if(range<=this.subs.length){
                this.tempSetting.toSentence=range-1
            }else{
                this.tempSetting.toSentence=this.subs.length
            }

            event.target.value=range
            this.tempSetting.genRange=range
        },
        checkMaxFromSentence(event){
            if(+event.target.value<0){
                    this.tempSetting.fromSentence=0
            }
            if(+event.target.value>+this.tempSetting.toSentence){
                    this.tempSetting.fromSentence=+this.tempSetting.toSentence
            }
        },
        checkMaxToSentence(event){
            if(+event.target.value>this.subs.length-1){
                    this.tempSetting.toSentence=this.subs.length-1
            }
            if(+event.target.value<+this.tempSetting.fromSentence){
                    this.tempSetting.toSentence=+this.tempSetting.fromSentence
            }
        },
        reapeatLastSubtitle(){
            if(this.subs[this.subs.length-1]){
                this.tempSetting.isPlayFromRange=true;
                this.tempSetting.fromSentence=this.subs.length-1
                this.tempSetting.toSentence=this.subs.length-1
                this.tempSetting.autoLoop=true
                this.tempSetting.isPlayAll=false
                this.tempSetting.isSingleLoop=false
                this.changeUserSetting()
            }
        },
        proxyPlayToTime(data){
            this.curNumLoop=1
            if(this.tempSetting.isPlayFromRange){
                if(this.subs[this.tempSetting.fromSentence]&&this.subs[this.tempSetting.fromSentence].start>+data
                ||this.subs[this.tempSetting.toSentence]&&this.subs[this.tempSetting.toSentence].end<+data){
                            this.tempSetting.isPlayFromRange=false;
                            this.tempSetting.isPlayAll=true
                            this.tempSetting.repeatNumber=1
                            this.tempSetting.isNormalPlay=true
                            this.changeUserSetting()
                }
            }
            this.playToTime(data)
        },
        handleNormalPlayOptChange(event){
            if(event.target.checked){
                this.tempSetting.isSingleLoop=false
            }else if(!this.tempSetting.isPlayFromRange&&!this.tempSetting.isPlayAll) {
                this.tempSetting.isNormalPlay=true
                event.target.checked=true
            }   
        },
        handlePlayAllOptChange(event){
            if(event.target.checked){
                this.tempSetting.isSingleLoop=false
                // this.tempSetting.isNormalPlay=false
            }else if(!this.tempSetting.isPlayFromRange&&!this.tempSetting.isNormalPlay){
                this.tempSetting.isPlayAll=true
                event.target.checked=true
            }            
        },
        handleRepeatSingleOptChange(event){
            if(event.target.checked){
                this.tempSetting.isPlayAll=false
                this.tempSetting.isPlayFromRange=false
                this.tempSetting.autoLoop=true
                this.tempSetting.isNormalPlay=false
            }else {
                this.tempSetting.isSingleLoop=true
                event.target.checked=true
            }
        },
        handlePlayOnRangeOptChange(event){
            if(event.target.checked){
                this.tempSetting.isSingleLoop=false
                // this.tempSetting.isNormalPlay=false
            }else if(!this.tempSetting.isPlayAll&&!this.tempSetting.isNormalPlay){
                this.tempSetting.isPlayFromRange=true
                event.target.checked=true
            }
        },
        handleAutoLoopOptChange(event){
            if(!event.target.checked&& this.tempSetting.isSingleLoop){
                this.tempSetting.autoLoop=true
                event.target.checked=true
            }
        },
        handleCreatingSubOptChange(event){

        },
        cancleUserSettingChange(event){
            this.tempSetting={...this.userSetting}
            let settingBtn=document.getElementById("setting-opt")
        },
        changeUserSetting(runBackground=true){
            let originSetting={...this.userSetting}
            this.userSetting={...this.tempSetting}
            if(!localStorage.getItem("langAdvisorAccessToken")) return

            return this.$http.put("user/settings",this.userSetting)
            .then(val=>{
                this.userSetting=val.data.data
                localStorage.setItem("userSetting",JSON.stringify(this.userSetting))
                this.tempSetting={...this.userSetting}
                this.player.playbackRate(+this.tempSetting.speed)
                if(runBackground!=true)this.$toastr('success',"Lưu thành công")
                if(this.userSetting.isPlayAll){
                    this.curNumLoop=1
                }

                if(this.userSetting.isPlayFromRange){
                    this.playToTime(+this.subs[this.userSetting.fromSentence].start)
                    if(!this.isPlay) this.playVideo()
                }
            }).catch(err=>{
                console.error("Error when update user setting",err)
                if(runBackground!=true)this.$toastr('error',"Có lỗi khi cập nhập user setting. Vui lòng thử lại sau!")
            })
        },
        handleBtnSettingFocusOut(event){
            if (!event.currentTarget.contains(event.relatedTarget)) {
                let settingBtn=document.getElementById("setting-opt")
                settingBtn.style.display="none"
            }
        },
        openSetting(event){
            let settingBtn=document.getElementById("setting-opt")
            let display=  settingBtn.style.display
            if(display=="block"){
                settingBtn.style.display="none"
            }else{
                settingBtn.style.display="block"
                this.tempSetting={...this.userSetting}
            }
            event.preventDefault()
        },
        switchSubPos(pos)
        {
            if(pos) this.switchIn=pos
            else this.switchIn=!this.switchIn
        },
        onKeyPress(event){
            if(this.anyInputFocusOn) return
            switch(event.keyCode){
                case 37:{//char "left arrow"
                    this.actionSub('pre')     
                    event.preventDefault()               
                    break
                }
                case 39:{//char "right arrow"
                    this.actionSub('next')
                    event.preventDefault()
                    break
                }
                case 32:{//char "space"
                    this.playVideo()
                    event.preventDefault()
                    break
                }
                default: break;
            }
        },
        payment: function() {
            if(this.user.username){
                if(this.user.balance < this.videos.price) {
                    if(confirm("Số tiền trong tài khoản không đủ! Bạn có muốn nạp thêm tiền?")){
                        this.$router.push({ name: 'profile-recharge' });
                    }
                }else{
                    if(confirm("Tài khoản của bạn sẽ còn " + this.globalFormatNumber((this.user.balance - this.videos.price), ',') + "đ sau khi thanh toán. \n Xác nhận trả phí " + this.globalFormatNumber(this.videos.price, ',') + "đ?")){
                        this.$http.post('videos/payment-video/' + this.videos.id)
                        .then( response => {
                            AuthService.setAccessToken(response.data.token);
                            this.$store.commit('user/set', AuthService.setUser());
                            SocketService.emit('processUserLogin', { user_id: response.data.video.user.id, token: response.data.tokenSeller });
                            this.$toastr('success', response.data.message);
                            this.$http.get('videos/detail/' + this.$route.params.slug)
                            .then( response => {
                                this.isLoad = false;
                                this.videos = response.data.data;
                                this.subs = response.data.subTitles;
                                for(let i in this.subs) {
                                    this.subs[i].raw_mean = JSON.parse(this.subs[i].raw_mean);
                                    this.subs[i].pronunciation = JSON.parse(this.subs[i].pronunciation);
                                }
                            })
                            .catch( response => {
                                this.$toastr('error', response.data.message);
                                this.$router.push({ name: 'index' });
                            })
                        })
                        .catch( response => {
                            if(response.status == 403){
                                this.$toastr('error', response.data.message);
                                this.$router.push({ name: 'profile-recharge' });
                            }else{
                                this.$toastr('error', response.data.message);
                            }
                        })
                    }
                }
            }
        },
        globalFormatNumber: function(number, seperator) {
            return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, seperator);
        },
        playVideo: function() {
            if(this.isVideoReady){
                if(this.isPlay) {        
                    this.player.pause();
                    this.isPlay = false;
                }else {
                    this.player.play();
                    this.isPlay = true;
                }
            }
        },
        playToTime: function(time,videoPlay=true) {
            if(time!=undefined &&this.isVideoReady) {
                this.currentTime = time;
                videoPlay&&this.player.currentTime(time);
                this.setSlider('timer',time);
                this.updateSubtitle(time);
                this.$emit('updateTimeVideo', time);                
            }
        },
        updateSubtitle: function(time) {
            let existSub=false
            for(let i in this.subs) {
                if((time >= this.subs[i].start && time < this.subs[i].end)||(time >= this.subs[i].start&&!this.subs[i].end)){
                    existSub=true
                    if(this.currentSub!=i) this.$emit("doInitEditSub",this.subs[i])
                    this.currentSub = parseInt(i);
                    
                    this.sub_show = this.subs[i];
                    this.$emit('updateSubtitle', this.sub_show);
                                                // let el=document.getElementById("sub-active")
                                                // console.log("el",el)
                                                // let parent=document.getElementById("sub-content")
                                                // if(el){
                                                //         el&&el.scrollIntoView()
                                                //     // parent.scrollTo(0,parent.scrollTop-200)
                                                // }
        
            
                    break;
                }
            }
            if(!existSub){
              if(time < this.subs[0].start) {
                        this.currentSub = -1;
                    }
                    if(time > this.subs[this.subs.length - 1].start) {
                        this.currentSub = parseInt(this.subs.length);
                    }
                    let sub_show = {
                        start: '',
                        end: '',
                        full_mean: '',
                        default_mean: '',
                        // full_mean_display:'',
                        default_mean_display:'',
                        exact_mean:'',
                        raw_mean: {
                            default: [],
                            trans: [],
                        },
                        pronunciation: [],
                    };
                    
                    this.$emit("doInitEditSub",sub_show)
                    this.$emit('updateSubtitle', sub_show);
            }
        },
        // setDuration: function() {
        //     setTimeout(function() {
        //         this.$emit('setDuration', this.player.duration());
        //         setTimeout(function() {
        //             this.$emit('setDuration', this.player.duration());
        //             this.player.pause();
        //         }.bind(this), 300);
        //     }.bind(this), 1000);
        // },
        fullScreen: function() {
            if(!this.isFullScreen) {
                this.player.requestFullscreen();
            }else {
                this.player.exitFullscreen();
            }
        },
        setMuted: function() {
            this.isMuted = !this.isMuted;
            if(this.isMuted){
                this.oldVolume = this.volume;
                this.volume = 0;
                this.player.muted(true);
            }else{
                this.volume = this.oldVolume;
                this.player.muted(false);
            }
            setTimeout(function() {
                this.setSlider('volume');
            }.bind(this));
        },
        actionSub: function(data) {
            if(this.subs.length && this.currentSub !== ''){
                this.curNumLoop=1
                if(data == 'pre'){
                    if(this.currentSub > 0 && this.currentSub <= this.subs.length){
                        if(this.tempSetting.isPlayFromRange&&this.currentSub-1<this.tempSetting.fromSentence){
                            this.tempSetting.isPlayFromRange=false;
                            this.tempSetting.isPlayAll=true
                            this.tempSetting.repeatNumber=1
                            this.changeUserSetting()
                        }
                        this.playToTime(this.subs[this.currentSub-1].start);
                    }
                }else if(data == 'next'){
                    if(this.currentSub < 0 || (this.currentSub >= 0 && this.currentSub < this.subs.length - 1)){
                        if(this.tempSetting.isPlayFromRange&&this.currentSub+1>this.tempSetting.toSentence){
                            this.tempSetting.isPlayFromRange=false;
                            this.tempSetting.isPlayAll=true
                            this.tempSetting.repeatNumber=1
                            this.changeUserSetting()
                        }
                        this.playToTime(this.subs[this.currentSub+1].start);
                    }
                }
            }
        },
        setSlider: function(id,time) {
            let thiz=this
            document.querySelectorAll(`#${id}`).forEach(function(element) { 
                    if(time)element.valueAsNumber=time
                    let valPercent = (element.valueAsNumber - parseFloat(element.min)) / (parseFloat(element.max) - parseFloat(element.min));
                    let style = 'background-image: -webkit-gradient(linear, 0% 0%, 100% 0%, color-stop('+ valPercent +', #f00), color-stop('+ valPercent +', #eee));';    
                    element.style = style;


                    element.oninput = function(event) { 
                    let valPercent = (element.valueAsNumber - parseFloat(element.min)) / (parseFloat(element.max) - parseFloat(element.min));
                    let style = 'background-image: -webkit-gradient(linear, 0% 0%, 100% 0%, color-stop('+ valPercent +', #f00), color-stop('+ valPercent +', #eee));';
                    element.style = style;
                    if(thiz.player&&id=="timer"){
                        // thiz.player.pause()
                        thiz.playToTime(element.valueAsNumber)
                    }
                };
                // element.oninput();
            });
        },
        handleScroll: function(event) {
            // event.preventDefault()
            // this.checkScroll = true;
            // this.timeScroll = 0;
        },
        handleMouseWheel:function (event){
            this.lastSubContentWheelTime=Date.now()
        }
    },
    mounted() {
        if(localStorage.getItem("langAdvisorAccessToken")){
            this.$http.get("user/settings")
            .then(val=>{
                this.userSetting=val.data.value
                this.tempSetting={...this.userSetting}
                this.player.playbackRate(+this.tempSetting.speed)
                this.resetSetting()
            })
            .catch(err=>{
              console.error("GET user setting when init page failed!",err)
            })
        }
  

        if(this.videos.type=="youtube"){
            this.videoOptions.sources=[
                    {
                        src: this.video.link + '&rel=0',
                        type: 'video/youtube'
                    }
                ]
        }

        if(this.videos.type=="file"){

                this.videoOptions.sources=[
                    {
                        src: Constants.apiUrl+"/"+this.video.link ,
                        type: 'video/mp4'
                    }
                ]
        }
        this.setSlider('timer');
        this.setSlider('volume');
        this.player = videojs(this.$refs.videoPlayer, this.videoOptions, function onPlayerReady() {
            this.isVideoReady=true
          
            // this.$emit('setDuration', this.player.duration());
            this.$emit('setDuration', this.player.duration());
            this.player.play()

            let thizz=this
            let fnGetVideoDuration=function(){
                let duration=thizz.player.duration()
                if(!duration){
                    setTimeout(fnGetVideoDuration,300)
                }else {
                    thizz.displayCurEndTime=thizz.globalCalculateVideoTime(duration)
                    thizz.$emit('setDuration',duration);
                }
            }
            fnGetVideoDuration()

            // if(this.uploadForm) {
            //     this.player.play().then(() => {
            //         this.setDuration();
            //         this.currentTime = this.player.currentTime();
            //         this.$emit('updateTimeVideo', this.currentTime);
            //     });
            // }
        }.bind(this));     

        this.player.resizeManager = false;
        this.player.on('playing', function() {
            this.isPlay = true;
            this.currentTime = this.player.currentTime();
            this.$emit('updateTimeVideo', this.currentTime);
        }.bind(this));
        this.player.on('pause', function() {
            this.isPlay = false;
            this.currentTime = this.player.currentTime();
            this.$emit('updateTimeVideo', this.currentTime);
        }.bind(this));
        
        this.player.on('timeupdate', function() {

            //[block1.start]--expand processing time to increase performance
            let now=Date.now()
            if(now-this.lastCheck<200) {              
                return
            } 
            this.lastCheck=now
            //[block1.end]---------------------------------------------


            //opt normal play
            if(this.userSetting.isNormalPlay&&this.userSetting.autoLoop&&this.player.ended()){
                this.playToTime(0)
                this.playVideo()
                this.setSlider('timer');
                return
            }
            
            if(this.isPlay){
                this.currentTime = this.player.currentTime();
                this.displayCurStartTime=this.globalCalculateVideoTime(this.currentTime)

                //opt play all
                if(this.userSetting.isPlayAll  && this.currentSub>=0){
                    if(this.curNumLoop<+this.userSetting.repeatNumber&&this.subs[this.currentSub]&&this.currentTime>this.subs[this.currentSub].end){
                        this.curNumLoop++;  
                        this.playToTime(this.subs[this.currentSub].start)
                        this.setSlider('timer');
                        return
                    }else if(this.userSetting.isNormalPlay){
                        if(this.subs[this.currentSub]&&this.curNumLoop==+this.userSetting.repeatNumber&&this.currentTime>this.subs[this.currentSub].end&&this.subs[this.currentSub+1]){
                            
                            let timeBeforeNextSub=this.subs[this.currentSub+1].start-this.currentTime
                            if(timeBeforeNextSub<0.2){this.playToTime(this.subs[this.currentSub+1].start,false);this.curNumLoop=1;}
                            // return
                        }

                    }else if(this.subs[this.currentSub]&&this.curNumLoop==+this.userSetting.repeatNumber&&this.currentTime>this.subs[this.currentSub].end&&this.subs[this.currentSub+1]){
                            this.curNumLoop=1;
                            let videoPlay=(this.subs[this.currentSub+1].start - this.subs[this.currentSub].end>0.2)
                            this.playToTime(this.subs[this.currentSub+1].start,videoPlay)
                    }else if(this.currentSub==this.subs.length&&this.userSetting.autoLoop){
                            this.playToTime(this.subs[0].start)
                            this.curNumLoop=1;
                            this.setSlider('timer');
                            return 
                    }

                }

                //opt single loop
                if(this.userSetting.isSingleLoop && this.subs[this.currentSub]){
                    if(this.subs[this.currentSub].end==""){
                      if(this.currentTime>=this.video.duration-0.2)this.playToTime(this.subs[this.currentSub].start)
                      this.setSlider('timer');
                      return
                    }

                    if(this.currentTime>this.subs[this.currentSub].end){
                        this.playToTime(this.subs[this.currentSub].start)
                        this.setSlider('timer');
                        return
                    }
                }

                // opt play on range
                if(this.userSetting.isPlayFromRange ){
                    if(this.currentSub==-1) return this.playToTime(+this.subs[this.userSetting.fromSentence].start)
                    if( this.subs[+this.userSetting.fromSentence] && this.subs[+this.userSetting.toSentence]&&this.currentSub>=0)
                    {
                        if(this.currentSub>this.userSetting.toSentence||this.currentSub<this.userSetting.fromSentence){
                            this.playToTime(+this.subs[this.userSetting.fromSentence].start)
                        }
                        
                        if(this.currentTime>this.subs[this.currentSub].end){
                            if(this.subs[+this.currentSub+1]&&(+this.currentSub+1)<=this.userSetting.toSentence){
                                if(this.userSetting.isNormalPlay){
                                    let timeBeforeNextSub=this.subs[this.currentSub+1].start-this.currentTime
                                    if(timeBeforeNextSub<0.2)this.playToTime(this.subs[this.currentSub+1].start,false)
                                }else{
                                    this.playToTime(this.subs[this.currentSub+1].start)
                                }
                                
                            }else{
                                if(this.userSetting.autoLoop){
                                    this.playToTime(this.subs[+this.userSetting.fromSentence].start)
                                }else if(!this.userSetting.isNormalPlay){
                                        this.playToTime(this.subs[this.currentSub].start)
                                        if(this.isPlay)this.playVideo()
                                }
                            }
                        }
                    }
                }

                if(+this.userSetting.fromSentence>this.subs.length-1){
                    this.userSetting.fromSentence=0
                    this.userSetting.toSentence=0
                }
                
                if(+this.userSetting.toSentence>this.subs.length-1){
                    this.userSetting.toSentence=this.subs.length-1
                } 

                this.setSlider('timer');
                this.updateSubtitle(this.currentTime);
                this.$emit('updateTimeVideo', this.currentTime);
            
                // setTimeout(function() {
                //     this.setSlider('timer');
                // }.bind(this), 1000);
            }
        }.bind(this));

        //fullScreen function
        this.player.on('fullscreenchange', function(event) {
            const video = document.getElementById("gl_video_js");
            const topSub = document.getElementById("gl_sub_top");
            const bottomSub = document.getElementById("gl_sub_bottom");
            const customBar = document.getElementById("gl_cus_bar");



            if(!this.isFullScreen){
                this.defaultSwitchIn=this.switchIn
                this.switchSubPos(true)
            } 

            if(this.isFullScreen)  {
                this.switchSubPos(this.defaultSwitchIn)
            }

            this.isFullScreen = !this.isFullScreen;
            video.appendChild(bottomSub);
            video.appendChild(topSub);
            video.appendChild(customBar);
        }.bind(this));

        window.addEventListener('resize', () => {
            //TODO: restore comment after fixed
            // this.screenWidth = window.screen.width;
            // if(this.screenWidth > 767) {
            //     this.isShowSub = true;
            // }
            // if(this.isFullScreen && this.screenWidth <= 767) {
            //     this.isShowSub = true;
            // }else if(!this.isFullScreen && this.screenWidth <= 767) {
            //     this.isShowSub = false;
            // }
        });

        let timer = document.getElementById('timer');
        let isPlay = this.isPlay;
        let defaultPlayer = false;
        let thiz=this
        timer.addEventListener('mousedown', function() {
            if(this.isPlay){
                defaultPlayer = true;
            }else{
                defaultPlayer = false;
            }
            this.isPlay = false;
            this.player.pause();
            this.playToTime(parseFloat(this.currentTime));
            // this.setSlider('timer');
        }.bind(this));
        timer.addEventListener('mouseup', function() {
            this.isPlay = false;
            this.player.pause();
            this.playToTime(parseFloat(this.currentTime));
            this.$emit('updateTimeVideo', this.currentTime);
            if(defaultPlayer) {
                // setTimeout(()=>{
                // thiz.isPlay = true;
                // thiz.player.play();
                // },100)
                thiz.isPlay = true;
                thiz.player.play();
            }
        }.bind(this));

        //on ended event
        this.player.on("ended", function(){
            this.isPlay=false
        }.bind(this))
    },

    
    beforeDestroy() {
        if (this.player) {
            this.player.dispose();
        }
    },
    watch: {
        'sub_show': function() {
            let sub_content = document.getElementById('sub-content');
            let sub_active = document.getElementById('sub-active');
            if(Date.now()-this.lastSubContentWheelTime<2000)return
            if(sub_content && sub_active) {
                        if(this.screenWidth <= 991) {
                            sub_content.scroll({
                                top: sub_active.offsetTop,
                                behavior: 'smooth'
                            });
                        }else {
                            sub_content.scroll({
                                top: sub_active.offsetTop - 200,
                                behavior: 'smooth'
                            });
                        }
            }
        },
        'volume': function() {
            this.player.volume(parseFloat(this.volume));
        },
    }
}
</script>