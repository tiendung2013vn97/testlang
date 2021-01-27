<script type="text/javascript">
import Player from "~/components/client/video/Player.vue";
import PulseLoader from "vue-spinner/src/PulseLoader.vue";
import UploadFile from "~/components/common/UploadFile.vue";
import CkEditor from "~/components/dashboard/ckeditor/CkEditor.vue";
import videojs from "video.js";
import axios from "axios";
function parseTimeToSeconds(time) {
  let times = time.split(":");
  times[2] = times[2].replace(",", ".");
  times = times.map((item) => Number(item));
  return (
    (times[0] * 60 * 60 * 1000 + times[1] * 60 * 1000 + times[2] * 1000) / 1000
  );
}

function parseFileSrtToSubs(input) {
    try {
      input=input.trim()
      return input.split(/\n\n|\r\n\r\n/).map((sub) => {
      
          let subParts = sub.split(/\n|\r\n/);
          let index = subParts[0];
          let time = subParts[1];
          let startTime = time.split(" --> ")[0];
          let endTime = time.split(" --> ")[1];
          startTime = parseTimeToSeconds(startTime);
          endTime = parseTimeToSeconds(endTime);
          let text = "";
          for (let i = 2; i < subParts.length; i++) {
            if (i == 2) text += subParts[i];
            else text += ` ${subParts[i]}`;
          }

          return {
            start: startTime,
            end: endTime,
            full_mean: "",
            default_mean: text,
            exact_mean: "",
            default_mean_display: text,
            raw_mean: {
              default: [text],
              trans: [""],
            },
            pronunciation: [""],
          };
      });
   } catch (error) {
      console.log(`Invalid sub: ${input}`,error);
      return null
    }
}

export default {
    components: {
        Player,
        PulseLoader,
        UploadFile,
        CkEditor,
    },
    props: {
        video: "",
    },
    data() {
        return {
            subs: this.video.subtitles,
            sub_show: {
                start: "",
                end: "",
                full_mean: "",
                default_mean: "",
                exact_mean: "",
                // full_mean_display:"",
                default_mean_display: "",
                raw_mean: {
                    default: [],
                    trans: [],
                },
                pronunciation: [],
            },
            subData: {
                start: "",
                end: "",
                full_mean: "",
                default_mean: "",
                // full_mean_display:"",
                default_mean_display: "",
                exact_mean: "",
                raw_mean: {
                    default: [],
                    trans: [],
                },
                pronunciation: [],
            },
            videoDt: this.video,
            errors: {
                sub: {},
            },
            disabledSubmit: false,
            categories: [],
            lang: [],
            langTranslate: [],
            user: this.$store.state.user.data,
            imageKey: 0,
            count_sub_error: "",
            errors_key: 0,
            isValidLink: false,
            showSubButton: false,
            key: 0,
            keyCheckYTB: 0,
            currentTimeVideo: 0,
            indexSub: 0,
            videoLoaded: false,
            disabledFetchVideo: true,
            canUsePressShortcut: true,
            autoTranslate: false,
            uploadingFile: false,
            uploadingPercentage: 0,
            anyInputFocusOn: false,
            creatingNewSub: false,
            btnDeleteVideoDisabled: false,
            showDeleteVideoBtn: true
        };
    },
    created() {
        if (this.$route.name == "profile-video-upload")
            this.showDeleteVideoBtn = false;
        if (
            this.$route.params.slug ||
            this.$route.name == "dashboard-videos-update-id"
        ) {
            this.isValidLink = true;
            this.showSubButton = true;
        }

        this.initCategories();
        this.initLanguage();
        this.getChannel();
        //  if (this.showSubButton && this.videoDt.subtitles[0]) {
        //         this.subData = this.videoDt.subtitles[0];
        //     }
        window.addEventListener("keydown", this.keyPressHandler);
        //     let inputEls=document.querySelectorAll("input")
        //     console.log(inputEls)
        //     inputEls.forEach(el=>{
        //         el.onfocus=(e)=>{
        //         }
        //     })
    },
    methods: {
      resetImportSubInput(event){
        event.target.value=''
      },
        handleImportSub(event){
          let file = event.target.files[0];
  
          if(file){
            let reader = new FileReader();
            reader.onload = function(){
              let text = reader.result;
              let subs=parseFileSrtToSubs(text)       
              if(subs){
                this.video.subtitles=subs
                this.subs=subs
                // this.indexSub=0
                if(subs.length){
                  this.subData=subs[0]
                  this.sub_show=subs[0]
                }else{ 
                  this.subData={
                      start: "",
                      end: "",
                      full_mean: "",
                      default_mean: "",
                      // full_mean_display:"",
                      default_mean_display: "",
                      exact_mean: "",
                      raw_mean: {
                          default: [],
                          trans: [],
                      },
                      pronunciation: [],
                  }
                  this.sub_show=this.subData
                }
                
                this.$refs.videoPlayer.subs=this.subs
                this.$refs.videoPlayer.subs=this.subs
                this.$refs.videoPlayer.currentSub=0
                this.$refs.videoPlayer.sub_show=this.subs[0]
                this.$refs.videoPlayer.curNumLoop=1
                this.$refs.videoPlayer.updateRange()
                this.$refs.videoPlayer.currentTime= 0.000
                this.$refs.videoPlayer.playToTime(0,undefined,true); 
                this.$refs.videoPlayer.resetSetting()

              }
            }.bind(this);
            reader.readAsText(file);
          }

        },
        disableKeyEvent(event) {
            this.anyInputFocusOn = true;
        },
        enableKeyEvent(event) {
            this.anyInputFocusOn = false;
        },

        handleExactMeanChange(event){
          if(event.target.value==""&&this.autoTranslate){
            let textTranslate = {
                    text:[],
                    lang: this.videoDt.lang ? this.videoDt.lang : "",
                    langTranslate: this.videoDt.langTranslate
                        ? this.videoDt.langTranslate
                        : "",
                    default_mean: this.subData.default_mean,
                };
            this.$http
                    .post("translate/translate", textTranslate)
                    .then((response) => {
                        this.subData.exact_mean =this.subData.exact_mean||response.data.result.exact_mean
                    })
                    .catch((err) => {
                        console.log("error", err);
                    });
          }
        },

        handleAutoTranslateOptChange(event) {
            if (event.target.checked && this.subData.default_mean !== "") {
                let textTranslate = {
                    text: this.subData.raw_mean.default,
                    lang: this.videoDt.lang ? this.videoDt.lang : "",
                    langTranslate: this.videoDt.langTranslate
                        ? this.videoDt.langTranslate
                        : "",
                    default_mean: this.subData.default_mean,
                };
                this.$http
                    .post("translate/translate", textTranslate)
                    .then((response) => {
                        this.subData.raw_mean.default =
                            response.data.result.words;
                        this.subData.raw_mean.trans =
                            response.data.result.trans;

                        this.subData.default_mean = this.subData.raw_mean.default.join(
                            "`"
                        );
                        this.subData.full_mean = this.subData.raw_mean.trans.join(
                            "`"
                        );

                        this.subData.pronunciation =
                            response.data.result.pronunciation;

                        // this.subData.full_mean_display=this.subData.raw_mean.trans.join("")
                        this.subData.default_mean_display = this.subData.raw_mean.default.join(
                            ""
                        );
                        this.subData.exact_mean =this.subData.exact_mean||response.data.result.exact_mean
                    })
                    .catch((err) => {
                        console.log("error", err);
                    });
            }
        },
        handleTransSentenceChange(event) {
            let transWords = this.subData.raw_mean.trans;
            let newTransWords = [];
            let newDefaultWords = [];
            let newProWords = [];
            let lastCheckIndex = -1;

            this.subData.full_mean.split("`").forEach((fullMeanWord, index) => {
                fullMeanWord = fullMeanWord;

                let transWordsLength = transWords.length;
                let i;
                for (i = lastCheckIndex + 1; i < transWordsLength; i++) {
                    if (transWords[i] == fullMeanWord && i > lastCheckIndex) {
                        lastCheckIndex = i;
                        break;
                    }
                }

                //case transWords not contain fullMeanWord
                if (i == transWordsLength) {
                    newTransWords.push(fullMeanWord);
                    if (fullMeanWord == " ") {
                        newDefaultWords.push(
                            this.subData.raw_mean.default[index] || " "
                        );
                        newProWords.push(
                            this.subData.pronunciation[index] || " "
                        );
                    } else {
                        newDefaultWords.push(
                            this.subData.raw_mean.default[index] || ""
                        );
                        newProWords.push(
                            this.subData.pronunciation[index] || ""
                        );
                    }
                } else {
                    //case transWord contain fullMeanWord at position lastCheckIndex
                    newTransWords.push(
                        this.subData.raw_mean.trans[lastCheckIndex]
                    );
                    newDefaultWords.push(
                        this.subData.raw_mean.default[lastCheckIndex]
                    );
                    newProWords.push(
                        this.subData.pronunciation[lastCheckIndex]
                    );
                }
            });

            this.subData.raw_mean.trans = newTransWords;
            this.subData.raw_mean.default = newDefaultWords;
            this.subData.pronunciation = newProWords;
            this.subData.full_mean = newTransWords.join("`");
            this.subData.default_mean = newDefaultWords.join("`");
            // this.subData.full_mean_display=newTransWords.join('')
            this.subData.default_mean_display = newDefaultWords.join("");
        },
        handleTranslateWordChange(event, index) {
            event.target.value = event.target.value;
            this.subData.raw_mean.trans[index] = this.subData.raw_mean.trans[
                index
            ];
            this.subData.full_mean = this.subData.raw_mean.trans.join("`");
            // this.subData.full_mean_display=this.subData.raw_mean.trans.join("")
        },
        handleOriginWordChange(event, index) {
            event.target.value = event.target.value;
            this.subData.raw_mean.default[
                index
            ] = this.subData.raw_mean.default[index];
            this.subData.default_mean = this.subData.raw_mean.default.join("`");
            this.subData.default_mean_display = this.subData.raw_mean.default.join(
                ""
            );
        },
        removeWordAtIndex(index) {
            if (this.subData.raw_mean.default.length > 1) {
                this.subData.raw_mean.default.splice(index, 1);
                this.subData.raw_mean.trans.splice(index, 1);
                this.subData.pronunciation.splice(index, 1);
                this.subData.default_mean = this.subData.raw_mean.default.join(
                    "`"
                );
                this.subData.full_mean = this.subData.raw_mean.trans.join("`");
            }
        },
        addWordAtIndex(index) {
            this.subData.raw_mean.default.splice(index + 1, 0, "");
            this.subData.raw_mean.trans.splice(index + 1, 0, "");
            this.subData.pronunciation.splice(index + 1, 0, "");
            this.subData.default_mean = this.subData.raw_mean.default.join("`");
            this.subData.full_mean = this.subData.raw_mean.trans.join("`");
        },
        addOneSubWord() {
            this.subData.raw_mean.default.push("");
            this.subData.raw_mean.trans.push("");
            this.subData.pronunciation.push("");
        },
        removeOneSubWord() {
            this.subData.raw_mean.default.pop();
            this.subData.raw_mean.trans.pop();
            this.subData.pronunciation.pop();
        },
        initCategories: function () {
            this.$http.get("categories/all").then((response) => {
                this.categories = response.data.data;
            });
        },
        initLanguage: function () {
            this.$http.get("langs/all").then((response) => {
                this.lang = response.data.data;
                this.langTranslate = response.data.data;
            });
        },
        getChannel() {
            this.$http.get("channel/check-user-channel").then((response) => {
                this.channel = response.data.data;
                if (!this.channel) {
                    this.$router.push({ name: "profile-channel-create" });
                }
            });
        },
        deleteVideo() {
            this.btnDeleteVideoDisabled = true;
            this.$http
                .post("videos/delete/" + this.videoDt.id)
                .then((response) => {
                    this.$toastr("success", response.data.message);
                    this.$router.push({ name: "index" });
                })
                .catch((err) => {
                    console.log(err);
                    this.$toastr(
                        "error",
                        "Có lỗi trong quá trình xử lí. Vui lòng thử lại sau!"
                    );
                })
                .finally(() => {
                    this.btnDeleteVideoDisabled = false;
                });
        },
        submitUpload() {
            if (this.isValidLink) {
                this.checkError();
                if (!this.count_sub_error) {
                    if (
                        !this.videoDt.imageStr &&
                        !this.videoDt.image &&
                        window.location.path == "/profile/video/upload"
                    ) {
                        this.$toastr(
                            "error",
                            "Vui lòng chọn hình ảnh thumbnail trước khi submit!"
                        );
                    }
                    if (this.videoDt.type == "file")
                        this.videoDt.duration = document.getElementsByTagName(
                            "video"
                        )[0].duration;

                    this.disabledSubmit = true;
                    if (!this.videoDt.imageStr) {
                        this.videoDt.linkImage = this.videoDt.image;
                    }
                    
                    this.errors = {};
                    this.$http
                        .post(
                            this.$route.params.slug || this.$route.params.id
                                ? "videos/update/" + this.videoDt.id
                                : "videos/create",
                            this.videoDt
                        )
                        .then((response) => {
                            this.disabledSubmit = false;
                            this.imageKey++;
                            this.videoDt = response.data.data;
                            if (this.user.account_type === "ADMIN") {
                                if (
                                    this.$route.name ==
                                    "dashboard-videos-update-id"
                                ) {
                                    this.$router.push({
                                        name: "dashboard-videos",
                                        query: {
                                            page: this.$route.query.return,
                                        },
                                    });
                                } else {
                                    this.$router.push({
                                        name: "video-slug",
                                        params: { slug: this.videoDt.slug },
                                    });
                                }
                                this.$toastr("success", response.data.message);
                            } else {
                                if (this.$route.params.slug) {
                                    if (this.videoDt.status == "active") {
                                        this.$toastr(
                                            "success",
                                            "Cập nhật video thành công!"
                                        );
                                        this.$router.push({
                                            name: "video-slug",
                                            params: { slug: this.videoDt.slug },
                                        });
                                    } else {
                                        this.$toastr(
                                            "success",
                                            "Cập nhật video thành công. Video đang ở trạng thái chờ, vui lòng chờ Admin duyệt!"
                                        );
                                        this.$router.push({ name: "index" });
                                    }
                                } else {
                                    this.$toastr(
                                        "success",
                                        "Upload video thành công. Video đang ở trạng thái chờ, vui lòng chờ Admin duyệt!"
                                    );
                                    this.$router.push({ name: "index" });
                                }
                            }
                        })
                        .catch((response) => {
                            this.disabledSubmit = false;
                            if (response.status == 400) {
                                this.errors = response.data.errors;
                                if (!this.errors.sub) {
                                    this.errors.sub = {};
                                }
                                this.$toastr(
                                    "error",
                                    "Có lỗi trong quá trình xử lí dữ liệu"
                                );
                            } else {
                                this.$toastr("error", response.data.message);
                            }
                        });
                }
            } else {
                this.keyCheckYTB++;
                this.errors["link"] = ["Đường dẫn video không hợp lệ"];
                this.$toastr("error", "Có lỗi trong quá trình xử lí dữ liệu");
            }
        },
        changeImage: function (data) {
            let index = data.name.split(".");
            this[index[0]] = {
                ...this[index[0]],
                [index[1]]: data.base64String,
            };
        },
        changeContent: function (data) {
            let index = data.name.split(".");
            this[index[0]][index[1]] = data.content;
        },
        editSubtitles: function (data) {
            this.subData = data;
            for (let i in this.videoDt.subtitles) {
                if (data == this.videoDt.subtitles[i]) {
                    this.indexSub = i;
                }
            }
        },
        checkError: function () {
            for (let i in this.videoDt.subtitles) {
                let start = this.videoDt.subtitles[i].start;
                let end = this.videoDt.subtitles[i].end;
                if (start == "" || end == "") {
                    if (start == "") {
                        this.errors_key++;
                        this.errors.sub[`start_${i}`] = [
                            "Giây bắt đầu không được để trống",
                        ];
                    } else {
                        this.errors.sub[`start_${i}`] = [];
                    }
                    if (end == "") {
                        this.errors_key++;
                        this.errors.sub[`end_${i}`] = [
                            "Giây kết thúc không được để trống",
                        ];
                    } else {
                        this.errors.sub[`end_${i}`] = [];
                    }
                }
            }
            this.count_sub_error = 0;
            for (let i in this.errors.sub) {
                if (this.errors.sub[i].length) {
                    this.count_sub_error++;
                }
            }
            if (!this.count_sub_error) {
                this.subData = "";
                if (this.$refs.videoPlayer) {
                    // this.$refs.videoPlayer.reapeatLastSubtitle()
                }
            } else {
                this.$toastr(
                    "error",
                    "Vui lòng xử lý các lỗi của phụ đề trước khi tiếp tục"
                );
            }
        },
        addSubtitles: function () {
            this.checkError();
            if (!this.count_sub_error) {
                let sub = {
                    end: "",
                    full_mean: "",
                    default_mean: "",
                    raw_mean: {
                        default: [""],
                        trans: [""],
                    },
                    exact_mean: "",
                    pronunciation: [""],
                };

                if (this.videoDt.subtitles.length > 0) {
                    sub.start = Number.parseFloat(
                        this.videoDt.subtitles[
                            this.videoDt.subtitles.length - 1
                        ].end + 0.001
                    ).toFixed(3);
                } else {
                    sub.start = Number.parseFloat(
                        this.currentTimeVideo
                    ).toFixed(3);
                }

                this.videoDt.subtitles.push(sub);
                this.editSubtitles(sub);
                if (this.videoDt.subtitles.length > 0) {
                    this.validateTime(this.indexSub);
                }
            }
        },
        errorIndex: function (index) {
            if (
                (this.errors.sub[`start_${index}`] &&
                    this.errors.sub[`start_${index}`].length) ||
                (this.errors.sub[`end_${index}`] &&
                    this.errors.sub[`end_${index}`].length)
            ) {
                return true;
            }
            return false;
        },
        deleteSubtitles: function (index) {
            this.errors.sub[`start_${index}`] = [];
            this.errors.sub[`end_${index}`] = [];
            this.videoDt.subtitles.splice(index, 1);
        },
        initRawAndPronunciation: async function (data, index) {
            let ignoreAutoTrans=this.subData.default_mean.replace(/`/g, "") ==data.target.value.replace(/`/g, "")
            console.log("ignoreAutoTrans",ignoreAutoTrans)
            this.subData.default_mean=data.target.value
            let defaultWords = this.subData.raw_mean.default;
            let newTransWords = [];
            let newDefaultWords = [];
            let newProWords = [];
            let lastCheckIndex = -1;
            
            this.subData.default_mean
                .split("`")
                .forEach((defaultMeanWord, index) => {
                    defaultMeanWord = defaultMeanWord;

                    let defaultWordsLength = defaultWords.length;
                    let i;
                    for (i = lastCheckIndex + 1; i < defaultWordsLength; i++) {
                        if (
                            defaultWords[i] == defaultMeanWord &&
                            i > lastCheckIndex
                        ) {
                            lastCheckIndex = i;
                            break;
                        }
                    }

                    //case defaultWords not contain defaultMeanWord
                    if (i == defaultWordsLength) {
                        newDefaultWords.push(defaultMeanWord);
                        if (defaultMeanWord == " ") {
                            newTransWords.push(
                                this.subData.raw_mean.trans[index] || " "
                            );
                            newProWords.push(
                                this.subData.pronunciation[index] || " "
                            );
                        } else {
                            newTransWords.push(
                                this.subData.raw_mean.trans[index] || ""
                            );
                            newProWords.push(
                                this.subData.pronunciation[index] || ""
                            );
                        }
                    } else {
                        //case defaultWords contain defaultMeanWord at position lastCheckIndex
                        newTransWords.push(
                            this.subData.raw_mean.trans[lastCheckIndex]
                        );
                        newDefaultWords.push(
                            this.subData.raw_mean.default[lastCheckIndex]
                        );
                        newProWords.push(
                            this.subData.pronunciation[lastCheckIndex]
                        );
                    }
                });

            this.subData.raw_mean.trans = newTransWords;
            this.subData.raw_mean.default = newDefaultWords;
            this.subData.pronunciation = newProWords;
            this.subData.default_mean = newDefaultWords.join("`");
            this.subData.full_mean = newTransWords.join("`");
            this.subData.default_mean_display = newDefaultWords.join("");
            // this.subData.full_mean_display=newTransWords.join("")

            let textTranslate = {
                text: newDefaultWords,
                lang: this.videoDt.lang ? this.videoDt.lang : "",
                langTranslate: this.videoDt.langTranslate
                    ? this.videoDt.langTranslate
                    : "",
                default_mean: this.subData.default_mean,
            };

            if (!this.autoTranslate || this.subData.default_mean == ""||ignoreAutoTrans) return;
            this.$http
                .post("translate/translate", textTranslate)
                .then((response) => {
                    this.subData.raw_mean.default = response.data.result.words;
                    this.subData.raw_mean.trans = response.data.result.trans;

                    this.subData.default_mean = this.subData.raw_mean.default.join(
                        "`"
                    );
                    this.subData.full_mean = this.subData.raw_mean.trans.join(
                        "`"
                    );

                    this.subData.pronunciation =
                        response.data.result.pronunciation;

                    // this.subData.full_mean_display=this.subData.raw_mean.trans.join("")
                    this.subData.default_mean_display = this.subData.raw_mean.default.join(
                        ""
                    );
                    this.subData.exact_mean = this.subData.exact_mean||response.data.result.exact_mean;
                })
                .catch((err) => {
                    console.log("error", err);
                });
        },
        validateTime: function (index,event,type) {
          if(event){
              if(type=='start')this.videoDt.subtitles[index].start= event.target.value
              else this.videoDt.subtitles[index].end= event.target.value
          }
          

            let start = this.videoDt.subtitles[index].start;
            this.videoDt.subtitles[index].start = start
                ? parseFloat(start)
                : "";
            let end = this.videoDt.subtitles[index].end;
            this.videoDt.subtitles[index].end = end ? parseFloat(end) : "";
            if (isNaN(start) || isNaN(end)) {
                if (isNaN(start)) {
                    this.errors.sub[`start_${index}`] = [
                        "Giây bắt đầu phải là kiểu số",
                    ];
                } else {
                    this.errors.sub[`start_${index}`] = [];
                }
                if (isNaN(end)) {
                    this.errors.sub[`end_${index}`] = [
                        "Giây kết thúc phải là kiểu số",
                    ];
                } else {
                    this.errors.sub[`end_${index}`] = [];
                }
            } else {
                if (end && start >= end) {
                    this.errors.sub[`start_${index}`] = [];
                    this.errors.sub[`end_${index}`] = [
                        "Giây kết thúc phải lớn hơn giây bắt đầu",
                    ];
                } else {
                    if (parseFloat(end) - parseFloat(start) < 0.29) {
                        this.errors.sub[`end_${index}`] = [
                            "Giây kết thúc phải lớn hơn giây bắt đầu 0.3 giây",
                        ];
                    } else {
                        this.errors.sub[`start_${index}`] = [];
                        this.errors.sub[`end_${index}`] = [];
                        let previous_start = this.videoDt.subtitles[index - 1]
                            ? this.videoDt.subtitles[index - 1].start
                            : "";
                        let previous_end = this.videoDt.subtitles[index - 1]
                            ? this.videoDt.subtitles[index - 1].end
                            : "";
                        if (
                            start &&
                            previous_start &&
                            previous_end &&
                            (start <= previous_start || start <= previous_end)
                        ) {
                            this.errors.sub[`start_${index}`] = [
                                "Giây bắt đầu phải lớn hơn khoảng thời gian của phụ đề trước",
                            ];
                        } else if (
                            start &&
                            start > parseFloat(this.videoDt.duration)
                        ) {
                            this.errors.sub[`start_${index}`] = [
                                "Giây bắt đầu quá thời lượng của video",
                            ];
                        } else {
                            this.errors.sub[`start_${index}`] = [];
                        }

                        if (
                            end &&
                            previous_start &&
                            previous_end &&
                            (end <= previous_start || end <= previous_end)
                        ) {
                            this.errors.sub[`end_${index}`] = [
                                "Giây kết thúc phải lớn hơn khoảng thời gian của phụ đề trước",
                            ];
                        } else if (
                            end &&
                            end > parseFloat(this.videoDt.duration)
                        ) {
                            this.errors.sub[`end_${index}`] = [
                                "Giây kết thúc quá thời lượng của video",
                            ];
                        } else {
                            this.errors.sub[`end_${index}`] = [];
                        }

                        if (this.videoDt.subtitles[index + 1]) {
                            let next_start = this.videoDt.subtitles[index + 1]
                                .start;
                            let next_end = this.videoDt.subtitles[index + 1]
                                .end;
                            if (
                                start &&
                                end &&
                                (next_start <= start || next_start <= end)
                            ) {
                                this.errors.sub[`start_${index + 1}`] = [
                                    "Giây bắt đầu phải lớn hơn khoảng thời gian của phụ đề trước",
                                ];
                            } else {
                                this.errors.sub[`start_${index + 1}`] = [];
                            }
                            if (
                                start &&
                                end &&
                                (next_end <= start || next_end <= end)
                            ) {
                                this.errors.sub[`end_${index + 1}`] = [
                                    "Giây kết thúc phải lớn hơn khoảng thời gian của phụ đề trước",
                                ];
                            } else {
                                this.errors.sub[`end_${index + 1}`] = [];
                            }
                        }
                    }
                }
            }
        },
        setDuration: function (data) {
            this.videoDt.duration = data;
        },
        clickToPlay: function (data) {
            this.$refs.videoPlayer.playToTime(data,undefined,true);
        },
        doInitEditSub: function(data){
           if (this.showSubButton && this.videoDt.subtitles) {
                this.subData = data;
            }
        },
        handleMouseWheel: function(data){
          this.$refs.videoPlayer.handleMouseWheel()
        },
        updateSubtitle: function (data) {
            this.sub_show = data;
        },
        updateTimeVideo: function (data) {
            this.currentTimeVideo = data;
        },
        deleteSubArr: function (index) {
            if (this.videoDt.subtitles.length) {
                this.videoDt.subtitles.splice(index, 1);
            }
            delete this.errors.sub[`start_${index}`];
            delete this.errors.sub[`end_${index}`];
            this.checkError();
        },
        changeLanguage: function () {
            if (
                this.videoDt.langTranslate &&
                this.videoDt.lang &&
                this.videoDt.langTranslate.length != 0 &&
                this.videoDt.lang.length != 0
            ) {
                if (this.videoDt.langTranslate.id != this.videoDt.lang.id) {
                    this.errors["langTranslate"] = "";
                    this.errors["lang"] = "";
                    if (!this.showSubButton && this.videoDt.subtitles[0]) {
                        this.subData = this.videoDt.subtitles[0];
                    }
                    this.showSubButton = true;
                } else {
                    if (this.videoDt.langTranslate.id == this.videoDt.lang.id) {
                        this.errors["langTranslate"] = [
                            "Ngôn ngữ dịch không được trùng với ngôn ngữ học",
                        ];
                        this.errors["lang"] = "";
                        this.showSubButton = false;
                    }
                }
            } else {
                this.showSubButton = false;
            }
            this.key++;
        },
        submitSave() {
            if (this.isValidLink) {
                this.checkError();
                if (!this.count_sub_error) {
                    this.disabledSubmit = true;
                    this.errors = {};
                    if (!this.videoDt.imageStr) {
                        this.videoDt.linkImage = this.videoDt.image;
                    }
                    this.$http
                        .post("videos/create", this.videoDt)
                        .then((response) => {
                            this.errors = {};
                            this.disabledSubmit = false;
                            this.imageKey++;
                            this.videoDt = response.data.data;
                            if (this.user.account_type === "ADMIN") {
                                if (
                                    this.$route.name ==
                                    "dashboard-videos-update-id"
                                ) {
                                    this.$router.push({
                                        name: "dashboard-videos",
                                        query: {
                                            page: this.$route.query.return,
                                        },
                                    });
                                } else {
                                    this.$router.push({
                                        name: "profile-video-update-slug",
                                        params: { slug: this.videoDt.slug },
                                    });
                                }
                                this.$toastr("success", response.data.message);
                            } else {
                                this.$toastr(
                                    "success",
                                    "Upload video thành công. Video đang ở trạng thái chờ, vui lòng chờ Admin duyệt!"
                                );
                                let thiz = this;
                                setTimeout(() => {
                                    thiz.$router.push({
                                        name: "profile-video-update-slug",
                                        params: { slug: this.videoDt.slug },
                                    });
                                }, 500);
                            }
                        })
                        .catch((response) => {
                            this.disabledSubmit = false;
                            if (response.status == 400) {
                                this.errors = response.data.errors;
                                if (!this.errors.sub) {
                                    this.errors.sub = {};
                                }
                                this.$toastr(
                                    "error",
                                    "Có lỗi trong quá trình xử lí dữ liệu"
                                );
                            } else {
                                this.$toastr("error", response.data.message);
                            }
                        });
                }
            } else {
                this.keyCheckYTB++;
                this.errors["link"] = ["Đường dẫn video không hợp lệ"];
                this.$toastr("error", "Có lỗi trong quá trình xử lí dữ liệu");
            }
        },
        setTimeStart() {
            this.subData.start = Number.parseFloat(
                this.currentTimeVideo
            ).toFixed(3);
            this.validateTime(this.indexSub);
        },
        setTimeEnd() {
            if (
                Number.parseFloat(this.currentTimeVideo).toFixed(3) ==
                this.subData.start
            ) {
                this.subData.end = Number.parseFloat(
                    this.subData.start + 0.3
                ).toFixed(3);
            } else {
                this.subData.end = Number.parseFloat(
                    this.currentTimeVideo
                ).toFixed(3);
            }
            this.validateTime(this.indexSub);
        },
        handleClickUploadFile() {
            document.getElementById("fileInputAvatar").click();
        },
        async fetchVideo() {
            try {
                if (this.videoDt.type == "youtube") {
                    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
                    const video_id = this.videoDt.link.split("?v=")[1];
                    const response = await axios.get(
                        `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&part=snippet&id=${video_id}`
                    );
                    this.initCategories();
                    this.initLanguage();
                    this.videoDt.image = response.data.items[0].snippet
                        .thumbnails.high
                        ? response.data.items[0].snippet.thumbnails.high.url
                        : response.data.items[0].snippet.thumbnails.default.url;
                    this.videoDt.title = response.data.items[0].snippet.title;
                    this.videoDt.description =
                        response.data.items[0].snippet.description;
                    this.isValidLink = true;
                    this.videoDt.duration = "";
                    this.videoDt.categories = "";
                    this.videoDt.lang = [];
                    this.videoDt.langTranslate = [];
                    this.videoDt.subtitles = [];
                    this.videoLoaded = true;
                    this.errors["link"] = "";
                } else if (this.videoDt.type == "youtube") {
                    this.$toastr(
                        "error",
                        "Tạm thời chưa hỗ trợ video facebook!"
                    );
                }
            } catch (error) {
                this.$toastr(
                    "error",
                    "Có lỗi trong quá trình upload video. Vui lòng thử lại sau!"
                );
            }
        },
        async checkLinkVideo() {
            if (this.videoDt.type === "file") return;

            this.showSubButton = false;
            if (
                /^http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?$/.test(
                    this.videoDt.link
                )
            ) {
                this.errors["link"] = [""];
                this.videoDt.type = "youtube";
                this.disabledFetchVideo = false;
            } else if (
                /^(https?:\/\/www\.facebook\.com\/(?:video\.php\?v=\d+|.*?\/videos\/\d+))$/.test(
                    this.videoDt.link
                )
            ) {
                this.errors["link"] = [""];
                this.videoDt.type = "facebook";
                this.disabledFetchVideo = false;
            } else {
                this.disabledFetchVideo = true;
                this.isValidLink = false;
                this.videoDt.image = "";
                this.videoDt.title = "";
                this.videoDt.description = "";
                this.subs = [];
                this.videoDt.lang = [];
                this.videoDt.langTranslate = [];
                this.videoDt.categories = "";
                this.videoDt.duration = "";
                this.videoDt.price = "";
                this.errors["link"] = ["Đường dẫn video không hợp lệ"];
            }
        },
        keyPressHandler(event) {
            if (this.anyInputFocusOn || !this.showSubButton) return;
            switch (event.keyCode) {
                case 49: {
                    //char "1"
                    if (this.subData == "") return;
                    this.setTimeStart();
                    event.preventDefault();
                    break;
                }
                case 50: {
                    //char "2"
                    if (this.subData == "") return;
                    this.setTimeEnd();
                    event.preventDefault();
                    break;
                }
                // case 51: {
                //     //char "3"
                //     if (this.subData == "") return;
                //     this.checkError();
                //     event.preventDefault();
                //     break;
                // }
                case 52: {
                    //char "4"
                    this.addSubtitles();
                    event.preventDefault();
                    break;
                }
                case 53: {
                    //char "5"
                    let checkbox = document.getElementById(
                        "checkbox-auto-translate"
                    );
                    if (checkbox) {
                        checkbox.click();
                        // checkbox.checked=!checkbox.checked
                    }
                    event.preventDefault();
                    break;
                }
                default:
                    break;
            }
        },

        storePreviewVideo(event) {
            this.uploadingFile = true;
            let file = event.target.files[0];
            let maxSize = 1024 * 1024 * 1024 * 6; //2GB

            let formData = new FormData();
            formData.append("video", file);

            if (file.size > maxSize) {
                this.$toastr(
                    "error",
                    "Kích thước video không được lớn hơn 2GB"
                );
                event.target.value = "";
                return;
            }

            let thiz = this;
            let config = {
                onUploadProgress: (progressEvent) =>
                    (thiz.uploadingPercentage = (
                        (progressEvent.loaded / +file.size) *
                        100
                    ).toFixed(2)),
            };

            this.$http
                .post("videos/create-preview-video", formData, config)
                .then((response) => {
                    this.initCategories();
                    this.initLanguage();
                    this.videoDt.type = "file";
                    this.videoDt.link = response.data;
                    this.isValidLink = true;
                    this.videoDt.duration = "";
                    this.videoDt.categories = "";
                    this.videoDt.lang = [];
                    this.videoDt.langTranslate = [];
                    this.videoDt.subtitles = [];
                    this.videoLoaded = true;
                    this.errors["link"] = "";
                })
                .catch((err) => {
                    console.log("error when upload preview video", err);
                    this.$toastr(
                        "error",
                        "Có lỗi trong quá trình xử lý. Vui lòng thử lại sau!"
                    );
                })
                .finally(() => {
                    this.uploadingFile = false;
                });

            // let reader = new FileReader();
            // reader.readAsDataURL(event.target.files[0]);

            // let formData=new FormData()
            // formData.append("myFile",file)
            // formData.append("param","testParam")

            // let thiz=this
            // thiz.videoDt.type="file"

            // reader.onloadend = function(){

            //     thiz.tempUploadVideo=this.result
            //     thiz.initCategories();
            //     thiz.initLanguage();
            //     // thiz.videoDt.image = await response.data.items[0].snippet
            //     //     .thumbnails.default.url;
            //     // thiz.videoDt.title = await response.data.items[0].snippet
            //     //     .title;
            //     // thiz.videoDt.description = await response.data.items[0]
            //     //     .snippet.description;
            //     thiz.isValidLink = true;
            //     thiz.videoDt.duration = "";
            //     thiz.videoDt.categories = "";
            //     thiz.videoDt.lang = [];
            //     thiz.videoDt.langTranslate = [];
            //     thiz.videoDt.subtitles = [];
            //     thiz.videoLoaded = true;
            //     thiz.errors["link"] = "";
            // }
        },
    },
    watch: {
        "videoDt.link": async function () {
            this.checkLinkVideo();
        }
    },
    destroyed() {
        window.removeEventListener("keydown", this.keyPressHandler);
    },
};
</script>
