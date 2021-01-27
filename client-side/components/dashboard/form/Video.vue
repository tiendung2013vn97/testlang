<template>
    <div class="card" v-if="video">
        <div class="card-body">
            <h4 class="card-title">{{ $route.params.id ?  'Sửa': 'Tạo mới' }}</h4>
            <p class="card-description">
                Video
            </p>
            <hr>
            <div class="forms-sample mt-2">
                <div class="form-group col-6" v-if="$route.params.id">
                    <label>Trạng thái:</label>
                    <select class="form-control" v-model="videoDt.status" >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                        <option value="pending">Đang chờ</option>
                        <option value="banned">Cấm</option>
                    </select>
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, id) in errors[`status`]">
                            <div :key="id" class="text-danger mt-2">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <div class="form-group col-6">
                    <label>Ảnh đại diện:</label>
                    <img class="d-flex" v-if="$route.params.id && videoDt.image" :src="globalImageUrl(videoDt.image)" width="550">
                    <UploadFile :name="`videoDt.imageStr`" @onChangeFile="changeImage"/>
                </div>
                <template v-if="categories">
                    <div class="forms-sample mt-2">
                        <div class="form-group col-6">
                            <label>Chọn danh mục (*):</label>
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
                    </div>
                </template>
                <div class="form-group col-6">
                    <label>Tiêu đề <template>(*)</template>:</label>
                    <input type="text" class="form-control" placeholder="Tiêu đề" v-model="videoDt.title">
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, id) in errors[`title`]">
                            <div :key="id" class="text-danger mt-2">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <div class="form-group col-6">
                    <label>Ngôn ngữ học<template>(*)</template>:</label>
                    <v-select
                        placeholder="Chọn ngôn ngữ học"
                        label="title"
                        track-by="title"
                        v-model="videoDt.lang"
                        :options="lang" 
                        :multiple="false" 
                    >
                    </v-select>
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, id) in errors[`lang`]">
                            <div :key="id" class="text-danger d-flex mt-2">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <div class="form-group col-6">
                    <label>Ngôn ngữ dịch<template>(*)</template>:</label>
                    <v-select
                        placeholder="Chọn ngôn ngữ dịch"
                        label="title"
                        track-by="title"
                        v-model="videoDt.langTranslate"
                        :options="langTranslate" 
                        :multiple="false" 
                    >
                    </v-select>
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, id) in errors[`langTranslate`]">
                            <div :key="id" class="text-danger d-flex mt-2">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <div class="form-group col-6">
                    <label>Giá: </label>
                    <input type="number" class="form-control" placeholder="Giá" min="0" v-model="videoDt.price">
                </div>
                <div class="form-group col-6">
                    <label>Mô tả <template></template>:</label>
                    <CkEditor :name="`videoDt.description`" :model="videoDt.description" @changeContent="changeContent" />
                </div>
                <div class="form-group col-6">
                    <label>Link video <template>(*)</template>:</label>
                    <input type="text" class="form-control" placeholder="Link video" v-model="videoDt.link">
                    <template v-if="globalObjectLength(errors)">
                        <template v-for="(error, id) in errors[`link`]">
                            <div :key="id" class="text-danger mt-2">{{ error }}</div>
                        </template>
                    </template>
                </div>
                <div class="form-group">
                    <label class="ml-2">Phụ đề:</label>
                    <div id="subTitles" class="position-relative" :class="videoDt.link ? 'd-md-flex' : 'd-none'">
                        <div class="gl-hot-fix-sub col-12 pr-0 text-right" v-if="videoDt.link">
                            <Player v-if="videoDt.link" :video="videoDt" :uploadForm="true" :key="videoDt.link" @setDuration="setDuration" ref="videoPlayer" @updateSubtitle="updateSubtitle" @updateTimeVideo="updateTimeVideo"/>
                        </div>
                        <div class="gl-sub-video__sub pr-lg-2 col-lg-6 order-first py-2">
                            <template v-for="(sub, index) in videoDt.subtitles">
                                <template v-if="sub == subData">
                                    <div class="sub-option" :key="index"> 
                                        <div class="">Khoảng thời gian phụ đề xuất hiện (giây):</div>
                                        <div class="row">
                                            <div class="col-6 mb-3">
                                                <input type="number" class="form-control" v-model="subData.start" placeholder="Nhập số giây bắt đầu ( VD: 120 ) " autocomplete="off" @change="validateTime(index)" min="0" step="0.001"/>
                                                <span @click="setTimeStart()" class="input-icon bg-white">
                                                    <i class="mdi mdi-clock" style="font-size: 20px"></i>
                                                </span>
                                                <template v-if="globalObjectLength(errors) && globalObjectLength(errors.sub)">
                                                    <template v-for="(error,id2) in errors.sub[`start_${index}`]">
                                                        <div class="text-danger d-flex mt-2"  :key="id2" >{{ error }}</div>
                                                    </template>
                                                </template>
                                            </div>
                                            <div class="col-6 editPosition">
                                                <input type="number" class="form-control" v-model="subData.end" placeholder="Nhập số giây kết thúc ( VD: 130 )" autocomplete="off" @change="validateTime(index)" min="0" step="0.001"/>
                                                <span @click="setTimeEnd()" class="input-icon bg-white">
                                                    <i class="mdi mdi-clock" style="font-size: 20px"></i>
                                                </span>
                                                <template v-if="globalObjectLength(errors) && globalObjectLength(errors.sub)">
                                                    <template v-for="(error,id3) in errors.sub[`end_${index}`]">
                                                        <div class="text-danger mt-2" :key="id3">{{ error }}</div>
                                                    </template>
                                                </template>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <div class="">Nhập câu gốc:</div>
                                            <div class="row">
                                                <div class="col-12">
                                                    <input type="text" class="form-control" v-model="subData.default_mean" placeholder="Vui lòng nhập bằng ngôn ngữ gốc ( VD: This song is from Youtube )" autocomplete="off" @change="initRawAndPronunciation(subData.default_mean, index)"/>
                                                </div>
                                            </div>
                                        </div> 
                                        <div class="mb-3" v-if="subData.raw_mean.trans.length && subData.pronunciation.length">
                                            <div class="">Dịch chuẩn:</div>
                                            <div class="row">
                                                <div class="col-12">
                                                    <input type="text" class="form-control" v-model="subData.full_mean" placeholder="Dịch chuẩn sang tiếng Việt ( VD: Bài hát này lấy từ Youtube )" autocomplete="off"/>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-3" v-if="subData.raw_mean.trans.length && subData.pronunciation.length">
                                            <div class="">Dịch thô từng từ ( VD: 
                                                <span class="mr-2"> Cái này</span>
                                                <span class="mr-2"> bài hát</span>
                                                <span class="mr-2"> là</span>
                                                <span class="mr-2"> từ</span>
                                                <span class=""> Youtube</span>
                                                ):
                                            </div>
                                            <div class="row">
                                                <div class="col-2 mb-2" v-for="(trans, index) in subData.raw_mean.trans" :key="index">
                                                    <input type="text" class="form-control" v-model="subData.raw_mean.trans[index]" placeholder="" autocomplete="off"/>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-3" v-if="subData.raw_mean.trans.length && subData.pronunciation.length">
                                            <div class="">Phiên âm từng từ ( VD: 
                                                <span class="mr-2"> /ðis/</span>
                                                <span class="mr-2"> /sɑːŋ/</span>
                                                <span class="mr-2"> /ɪz/</span>
                                                <span class="mr-2"> /frɑːm/</span>
                                                <span class=""> /ˈjuː.tuːb/</span>
                                                ):
                                            </div>
                                            <div class="row">
                                                <div class="col-2 mb-2" v-for="(pronunciation, index) in subData.pronunciation" :key="index">
                                                    <input type="text" class="form-control" v-model="subData.pronunciation[index]" placeholder="" autocomplete="off"/>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="pb-3">
                                            <button class="btn btn-outline-secondary" type="button" @click="checkError()">Xác nhận</button>
                                        </div>
                                        <hr/>
                                    </div>
                                </template>
                            </template>
                            <div class="sub-content" id="sub-content">
                                <template v-for="(sub, index) in subs">
                                    <div :key="index" class="content border-bottom p-2" :class="sub.start && sub_show.start == sub.start ? 'bg-dark text-white' : count_sub_error && errorIndex(index) ? 'border border-danger' : ''" :id="sub.start && sub_show.start == sub.start ? 'sub-active' : ''">
                                        <div>{{ sub.full_mean_dislay }}</div>
                                        <div>{{ sub.default_mean_display }}</div>
                                        <div class="d-flex py-1">
                                            <div class="mr-auto font-12 mt-auto">
                                                <template v-if="sub.start && sub.end">
                                                    {{ globalCalculateVideoTime(sub.start) }} - {{ globalCalculateVideoTime(sub.end) }}
                                                </template>
                                            </div>
                                            <div @click="clickToPlay(sub.start)" class="mdi mdi-eye text-info p-cursor mr-3" style="font-size: 20px;"></div>
                                            <div @click="editSubtitles(sub)" class="mdi mdi-pencil-box-outline text-success p-cursor mr-3" style="font-size: 20px;"></div>
                                            <div @click="deleteSubArr(index)" class="mdi mdi-delete text-danger p-cursor" style="font-size: 20px;"></div>
                                        </div>
                                    </div>
                                </template>
                            </div>
                            <button class="btn btn-outline-secondary mt-2" type="button" @click="addSubtitles">Thêm phụ đề</button>
                        </div>
                    </div>
                </div>
            </div>
            <button type="button" class="btn btn-success ml-2 mt-2 pd-2" @click="submitUpload" :disabled="disabledSubmit">
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
import UploadVideoMixin from '~/components/common/UploadVideoMixin.vue';

export default {
    mixins: [UploadVideoMixin],
}
</script>