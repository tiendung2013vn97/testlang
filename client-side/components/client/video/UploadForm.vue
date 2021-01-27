<template>
    <section class="gl-homepage-upload  gl-padding-content" v-if="isValidLink == true">
        <div class="gl-homepage-upload__content mx-auto border-radius-10 px-sm-5 pt-4 pb-5">
            <h1 class="font-24 font-md-30 font-weight-bold mb-1 text-center text-uppercase">{{ $route.params.slug || $route.params.id ?  'Sửa Video' : 'Tạo mới Video' }}</h1>
            <p class="text font-16 font-openSans mb-4 text-center">{{ $route.params.slug || $route.params.id ?  'Sửa Video' : 'Tạo mới Video' }} và phụ đề cho kênh của bạn</p>
            <div class="detail pl-md-5 pr-md-4">
                <div class="title d-flex">
                    <p class="font-weight-500 font-16 font-md-18 font-openSans mb-0 mr-4">Ảnh đại diện</p>
                    <div class="d-flex align-items-center text-danger cursor-pointer" @click="handleClickUploadFile">
                        <UploadFile id="fileInputAvatar" :name="`videoDt.imageStr`" @onChangeFile="changeImage" :key="imageKey"/>
                    </div>
                </div>
                <div class="picture d-flex mt-3 pb-1" v-if="$route.name == 'profile-video-upload'">
                    <div class="item-picture mr-3">
                        <img v-if="videoDt.image" :src="globalImageUrl(videoDt.image)" class="border-radius-5">
                        <img v-if="videoDt.imageStr" :src="globalImageUrl(videoDt.imageStr)" class="border-radius-5">
                    </div>
                </div>
                <div class="picture d-flex mt-3 pb-1" v-else>
                    <div class="item-picture mr-3">
                        <img v-if="$route.params.slug && videoDt.image" :src="globalImageUrl(videoDt.image)">
                    </div>
                </div>
                <div class="form-input">
                    <div class="mt-3">
                        <label class="font-weight-500 font-16 font-md-18 font-openSans mb-0">Danh mục *</label>
                        <v-select
                            placeholder="Chọn danh mục"
                            label="title"
                            track-by="title"
                            v-model="videoDt.categories"
                            :options="categories" 
                            :multiple="true" 
                        >
                        </v-select>
                        <template v-if="globalObjectLength(errors)">
                            <template v-for="(error, id) in errors[`categories`]">
                                <div :key="id" class="text-danger mt-2">{{ error }}</div>
                            </template>
                        </template>
                    </div>
                    <div class="mt-3">
                        <label class="font-weight-500 font-16 font-md-18 font-openSans mb-0">Tiêu đề *</label>
                        <input class="border-0 border-radius-10 font-14 font-md-16 w-100 mt-2 py-2 px-4" required type="text" v-model="videoDt.title" placeholder="Nhập tiêu đề" autocomplete="off"  @focus="disableKeyEvent" @blur="enableKeyEvent"/>
                        <template v-if="globalObjectLength(errors)">
                            <template v-for="(error, id) in errors[`title`]">
                                <div :key="id" class="text-danger d-flex mt-2">{{ error }}</div>
                            </template>
                        </template>
                    </div>
                    <div class="mt-3">
                        <label class="font-weight-500 font-16 font-md-18 font-openSans mb-0">Ngôn ngữ học *</label>
                        <v-select
                            placeholder="Chọn ngôn ngữ học"
                            label="title"
                            track-by="title"
                            v-model="videoDt.lang"
                            :options="lang" 
                            :multiple="false"
                            v-on:change="changeLanguage"
                        >
                        </v-select>
                        <template v-if="globalObjectLength(errors)">
                            <template v-for="(error, id) in errors[`lang`]">
                                <div :key="id" class="text-danger d-flex mt-2">{{ error }}</div>
                            </template>
                        </template>
                    </div>
                    <div class="mt-3">
                        <label class="font-weight-500 font-16 font-md-18 font-openSans mb-0">Ngôn ngữ dịch *</label>
                        <v-select
                            placeholder="Chọn ngôn ngữ dịch"
                            label="title"
                            track-by="title"
                            v-model="videoDt.langTranslate"
                            :options="langTranslate" 
                            :multiple="false"
                            v-on:change="changeLanguage"
                        >
                        </v-select>
                        <template v-if="globalObjectLength(errors)">
                            <template v-for="(error, id) in errors[`langTranslate`]">
                                <div :key="id" class="text-danger d-flex mt-2">{{ error }}</div>
                            </template>
                        </template>
                    </div>
                    <div class="mt-3">
                        <label class="font-weight-500 font-16 font-md-18 font-openSans mb-0">Giá</label>
                        <input class="border-0 border-radius-10 font-14 font-md-16 w-100 mt-2 py-2 px-4" type="number" v-model="videoDt.price" placeholder="Nhập giá" min="0" autocomplete="off"  @focus="disableKeyEvent" @blur="enableKeyEvent"/>
                    </div>
                    <div class="mt-3">
                        <label class="font-weight-500 font-16 font-md-18 font-openSans mb-0">Mô tả</label>
                        <CkEditor :name="`videoDt.description`" :model="videoDt.description" @changeContent="changeContent" />
                    </div>
                    <div class="mt-3" v-if="videoDt.type!='file'">
                        <label class="font-weight-500 font-16 font-md-18 font-openSans mb-0">Link video</label>
                        <input class="border-0 border-radius-10 font-14 font-md-16 w-100 mt-2 py-2 px-4" type="text" v-model="videoDt.link" v-on:change="checkLinkVideo()" placeholder="Nhập đường link Youtube"  @focus="disableKeyEvent" @blur="enableKeyEvent"/>
                        <template v-if="globalObjectLength(errors)">
                            <template v-for="(error, id) in errors[`link`]">
                                <div :key="id" class="text-danger d-flex mt-2">{{ error }}</div>
                            </template>
                        </template>
                    </div>
                </div>

                <!--[begin] Edit sub panel -->
                <template v-if="isValidLink ==  true && showSubButton == true || $route.params.slug && showSubButton == true">
                    <hr/>
                    <div class="mt-3" :key="key">
                        <div id="subTitles" class="position-relative" :class="videoDt.link ? 'd-lg-flex' : 'd-none'">
                            <div class="gl-hot-fix-sub col-12 text-right gl-video-form" v-if="videoDt.link">
                                <Player :anyInputFocusOn="anyInputFocusOn" @doInitEditSub="doInitEditSub" @disableKeyEvent="disableKeyEvent" @enableKeyEvent="enableKeyEvent"  :video="videoDt" :uploadForm="true" :key="videoDt.link" @setDuration="setDuration" ref="videoPlayer" @updateSubtitle="updateSubtitle" @updateTimeVideo="updateTimeVideo"/>
                            </div>
                            <div class="gl-homepage-upload__sub col-lg-6 order-first">

                                <!-- Sub lines container -->
                                <div class="sub-content" id="sub-content"  @mousewheel="handleMouseWheel">
                                    <template v-for="(sub, index) in videoDt.subtitles">
                                        <div class="content border-bottom p-2"
                                            :key=index
                                            @click="clickToPlay(sub.start)"
                                            :class="sub.start && sub_show.start == sub.start ? 'bg-dark text-white' : count_sub_error && errorIndex(index) ? 'border border-danger' : ''" :id="sub.start && sub_show.start == sub.start ? 'sub-active' : ''">
                                            <div>{{ sub.default_mean_display }}</div>
                                            <div>{{ sub.exact_mean }}</div>
                                            <div class="sub-index">
                                                <div class="sub-index-val">
                                                {{index}}
                                                </div>
                                            </div>
                                            <div class="d-flex py-1">
                                                <div class="mr-auto font-12 mt-auto">
                                                    <template v-if="sub.start && sub.end">
                                                        {{ globalCalculateVideoTime(sub.start) }} - {{ globalCalculateVideoTime(sub.end) }}
                                                    </template>
                                                </div>
                                                <button class="btn btn-outline-info rounded-circle mr-2 border-0" type="button" @click="clickToPlay(sub.start)">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                <button class="btn btn-outline-danger rounded-circle border-0" type="button" @click="deleteSubArr(index)">
                                                    <i class="fal fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                                <!--END: Sub lines container -->

                                <!-- [Begin]: Import file srt button -->
                                <br/><br/>
                                <div id="btn-import-sub">
                                    <label for="importSub" class="symbol-input btn-upload font-14 font-sm-16 px-4 px-sm-5 py-2 py-sm-3 labelUpload" >
                                      <i class="fas fa-file-upload icon"  style="font-size: 25px"></i>
                                          Import file sub 
                                    </label>
                                    <input type="file" id="importSub" style="visibility:hidden;"  name="filename" accept=".srt" @change="handleImportSub" @click="resetImportSubInput">
                                </div>
                                <!-- [End]: Import file srt button -->

                                <!-- Edit single sub container -->
                                <div id="edit-sub-container">
                                    <template v-for="(sub, index) in videoDt.subtitles">
                                        <template v-if="sub == subData">
                                            <div class="sub-option"  :key="index">
                                                <div class="min-title-edit-sub-index">Phụ đề {{index}}:</div>
                                                <div class="">Khoảng thời gian phụ đề xuất hiện (giây):</div>
                                                <div class="row mb-3">
                                                    <div class="col-6 position-relative">
                                                        <input type="number" class="form-control" :value="subData.start" placeholder="Nhập số giây bắt đầu ( VD: 120 ) " autocomplete="off" @change="validateTime(index,$event,'start')" min="0" step="0.001"  @focus="disableKeyEvent" @blur="enableKeyEvent"/>
                                                        <span @click="setTimeStart()" class="input-icon bg-white position-absolute right-0 top-0 mt-2 mr-4">
                                                            <i class="fa fa-clock-o" style="font-size: 25px"></i>
                                                        </span>
                                                        <template v-if="globalObjectLength(errors) && globalObjectLength(errors.sub)">
                                                            <template v-for="(error,index2) in errors.sub[`start_${index}`]">
                                                                <div class="text-danger mt-2"  :key="index2">{{ error }}</div>
                                                            </template>
                                                        </template>
                                                    </div>
                                                    <div class="col-6 position-relative">
                                                        <input type="number" class="form-control" :value="subData.end" placeholder="Nhập số giây kết thúc ( VD: 130 )" autocomplete="off" @change="validateTime(index,$event,'end')" min="0" step="0.001"  @focus="disableKeyEvent" @blur="enableKeyEvent"/>
                                                        <span @click="setTimeEnd()" class="input-icon bg-white position-absolute right-0 top-0 mt-2 mr-4">
                                                            <i class="fa fa-clock-o" style="font-size: 25px"></i>
                                                        </span>
                                                        <template v-if="globalObjectLength(errors) && globalObjectLength(errors.sub)">
                                                            <template v-for="(error,index3) in errors.sub[`end_${index}`]">
                                                                <div class="text-danger mt-2" :key="index3">{{ error }}</div>
                                                            </template>
                                                        </template>
                                                    </div>
                                                </div>
                                                <div class="mb-3">
                                                    <div class="">Nhập câu gốc:</div>
                                                    <div class="row">
                                                        <div class="col-12">
                                                            <input type="text" class="form-control" :value="subData.default_mean" placeholder="Vui lòng nhập bằng ngôn ngữ gốc ( VD: This song is from Youtube )" autocomplete="off" @change="initRawAndPronunciation($event, index)"  @focus="disableKeyEvent" @blur="enableKeyEvent"/>
                                                        </div>
                                                    </div>
                                                </div> 
                                                <div class="mb-3">
                                                    <div class="">Dịch chuẩn:</div>
                                                    <div class="row">
                                                        <div class="col-12">
                                                            <input type="text" class="form-control" v-model="subData.full_mean" placeholder="Dịch chuẩn sang tiếng Việt ( VD: Bài hát này lấy từ Youtube )" autocomplete="off" @change="handleTransSentenceChange"  @focus="disableKeyEvent" @blur="enableKeyEvent"/>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="mb-3">
                                                    <div class="">Dịch chính xác nghĩa:</div>
                                                    <div class="row">
                                                        <div class="col-12">
                                                            <input type="text" class="form-control" v-model="subData.exact_mean" placeholder="Dịch chính xác nghĩa của toàn bộ câu ( VD: Bài hát này lấy từ Youtube )" autocomplete="off"  @focus="disableKeyEvent" @blur="enableKeyEvent" @change="handleExactMeanChange"/>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div id="add-remove-one-word-container">
                                                        <div  id="auto-translate-opt-container">
                                                            Tự động dịch
                                                            <input id="checkbox-auto-translate" type="checkbox" v-model="autoTranslate" @change="handleAutoTranslateOptChange">
                                                        </div>                                               
                                                </div>

                                                <!-- <div class="mb-3" v-if="subData.raw_mean.trans.length"> -->
                                                <div class="mb-3" v-if="subData.raw_mean.trans.length">
                                                    <div class="row sub-row">
                                                        <div class="col-2 mb-2 sub-column" v-for="(trans, index) in subData.raw_mean.trans" :key="index">
                                                            <div class="btn-add-sub-container">
                                                                <i class="fas fa-plus-circle plus" @click="addWordAtIndex(index)"> </i>
                                                                <i v-if="subData.raw_mean.default.length > 1" class="fas fa-minus-circle minus" @click="removeWordAtIndex(index)"> </i>
                                                            </div>

                                                            <input type="text" class="form-control one-word-input" v-model="subData.raw_mean.default[index]" placeholder="câu gốc" autocomplete="off" @change="handleOriginWordChange($event,index)"  @focus="disableKeyEvent" @blur="enableKeyEvent"/>    
                                                            <input type="text" class="form-control one-word-input" v-model="subData.raw_mean.trans[index]" placeholder="câu dịch" autocomplete="off"  @change="handleTranslateWordChange($event,index)"  @focus="disableKeyEvent" @blur="enableKeyEvent"/>                                                        
                                                            <input type="text" class="form-control one-word-input" v-model="subData.pronunciation[index]" placeholder="phiên âm" autocomplete="off"   @focus="disableKeyEvent" @blur="enableKeyEvent"/>
                                                        </div>
                                                    </div>
                                                </div>
        
                                                <!-- <div class="pb-3">
                                                    <button class="btn btn-outline-secondary" type="button" @click="checkError()">Xác nhận</button>
                                                </div> -->
                                                <hr/>
                                            </div>
                                        </template>
                                    </template>
                                </div>
                                <!--END: Edit single sub container -->

                                <button class="btn btn-outline-secondary mt-2" type="button" @click="addSubtitles">Thêm phụ đề</button>
                            </div>
                        </div>
                    </div>
                </template>
                <!--[end] Edit sub panel -->

                <br/><br/><br/>
                <div class="button-load d-md-flex mt-4">
                    <button type="button" class="btn-upload font-16 font-md-18 py-2 mr-md-2 w-100" @click="submitUpload" :disabled="disabledSubmit" style="z-index: 8;">
                        <span v-if="disabledSubmit">
                            <PulseLoader :color="'white'" :size="'10px'"/>
                        </span>
                        <span v-else>
                            {{ $route.params.slug || $route.params.id ? 'Cập nhập' : 'Upload' }}
                        </span>
                    </button>
                    <button type="button" class="btn-delete font-16 font-md-18 py-2 mr-md-2 w-100" @click="deleteVideo" :disabled="btnDeleteVideoDisabled" style="z-index: 8;" v-if="showDeleteVideoBtn">
                        <span v-if="btnDeleteVideoDisabled">
                            <PulseLoader :color="'white'" :size="'10px'"/>
                        </span>
                        <span v-else>
                            Xóa video
                        </span>
                    </button>
                    <!-- <button type="button" class="btn-save font-16 font-md-18 text-uppercase border-radius-10 py-2 ml-md-2 mt-3 mt-md-0 w-100" @click="submitSave" :disabled="disabledSubmit">
                        <span v-if="disabledSubmit">
                            <PulseLoader :color="'white'" :size="'10px'"/>
                        </span>
                        <span v-else>
                            Lưu
                        </span>
                    </button> -->
                </div>
            </div>
        </div>
    </section>
    <section class="gl-homepage-upload container gl-padding-content" v-else>
        <div class="gl-homepage-upload__content mx-auto border-radius-10 px-sm-5 pt-4 pb-5">
            <h1 class="font-24 font-md-30 font-weight-bold mb-1 text-center text-uppercase">Tải video mới</h1>
            <p class="text font-14 font-md-16 font-openSans mb-4 text-center">Tạo video và phụ đề cho kênh của bạn</p>

            <!-- Upload from link -->
            <div class="link pl-md-5 pr-md-4">
                <div class="title d-flex align-items-center">
                    <i class="fas fa-paperclip cursor-pointer font-14 font-md-16 mr-2"></i>
                    <p class="mb-0 font-14 font-md-16">Link video<span class="text-danger ml-1">*</span></p>         
                </div>
                <div class="form-input position-relative mt-3">
                    <input class="border-0 border-radius-10 font-14 font-sm-16 w-100 pl-4 py-2 py-sm-3" type="text" v-model="videoDt.link" v-on:change="checkLinkVideo()" placeholder="Nhập đường link Youtube"  @focus="disableKeyEvent" @blur="enableKeyEvent"  :disabled="uploadingFile"/>
                    <button v-if="!videoLoaded" @click="fetchVideo" :disabled="disabledFetchVideo||uploadingFile" :class="[disabledFetchVideo||uploadingFile?'disableBtn':'']" class="symbol-input btn-upload position-absolute font-14 font-sm-16 px-4 px-sm-5 py-2 py-sm-3 "><i class="fas fa-level-up-alt"></i></button>
                </div>
                <template v-if="globalObjectLength(errors)">
                    <template v-for="(error, id) in errors[`link`]">
                        <div :key="id" class="text-danger d-flex mt-2">{{ error }}</div>
                    </template>
                </template>
            </div>

            <!-- Upload from file -->
            <br/><br/><br/>
            <div class="link pl-md-5 pr-md-4">
                <div class="title d-flex align-items-center">
                    <i class="fas fa-paperclip cursor-pointer font-14 font-md-16 mr-2"></i>
                    <p class="mb-0 font-14 font-md-16">Upload file từ máy tính:<span class="text-danger ml-1">*</span></p>         
                </div>
                <br/>
                <div>
                    <label for="uploadVideo" class="symbol-input btn-upload font-14 font-sm-16 px-4 px-sm-5 py-2 py-sm-3 labelUpload" :disabled="uploadingFile">
                        <div v-if="!uploadingFile">  Chọn file</div>
                        <div v-if="uploadingFile">
                            <span>
                                {{uploadingPercentage}} %
                            </span>
                            <span> <PulseLoader  :color="'white'" :size="'10px'"/></span>
                        </div>
                    </label>
                    <input type="file" id="uploadVideo" style="visibility:hidden;"  name="filename" accept="video/*" @change="storePreviewVideo">
                </div>
            </div>

        </div>
    </section>
</template>

<script type="text/javascript">
import UploadVideoMixin from '~/components/common/UploadVideoMixin.vue';

export default {
    mixins: [UploadVideoMixin],
    data:{
        
    }
}
</script>