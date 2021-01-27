const Middleware = require('./middleware');
const FieldsMiddleware = require('./fields.middleware');
const validator = require('validator');
const Regex = require('regex');

class VideoMiddleware extends Middleware {

    /**
     * Validate Create and Update resource
     */
    static async createAndUpdate(req, res, next){
        // Init
        const { title, link, categories, subtitles, duration, lang, langTranslate, type,imageStr,image } = req.body;
        const errors = {};
        var regexLink = new RegExp(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/);
        // // Process
        let needImgStr=type=="file"&&!image
        let required = FieldsMiddleware.checkRequired(
            needImgStr?{ title,imageStr,duration }:{ title, link, duration }, 
            needImgStr?[ 
                'title',
                'imageStr',
                'duration',
            ]:[ 
                'title',
                'link',
                'duration',
            ],
            needImgStr?[ 
                'Tiêu đề không được để trống',
                'Ảnh thumbnail không được để trống',
                'Thời lượng video được để trống',
            ]:[ 
                'Tiêu đề không được để trống',
                'Link không được để trống',
                'Thời lượng video được để trống',
            ]
        );
        required = required ? required : {};
        if(!categories || categories && categories.length <= 0){
            required.categories = [ 'Vui lòng chọn ít nhất một danh mục' ];
        }
        if(lang == null || lang.length == 0){
            required.lang = [ 'Vui lòng chọn ngôn ngữ học' ];
        }
        if(langTranslate == null || langTranslate.length == 0){
            required.langTranslate = [ 'Vui lòng chọn ngôn ngữ dịch' ];
        }
        if(Object.keys(required).length) {
            return this.sendRequestError(required, res);
        }
        if(lang.id == langTranslate.id){
            errors.langTranslate = this.buildError(errors, 'langTranslate', 'Ngôn ngữ dịch không được trùng với ngôn ngữ học');
        }
        if (type!=="file"&&(!validator.isURL(link, { require_tld: true }) || regexLink.test(link) === false)){
            errors.link = this.buildError(errors, 'link', 'Link video không đúng định dạng');
        }
        if(isNaN(duration)) {
            errors.duration = this.buildError(errors, 'duration', 'Thời lượng video phải là kiểu số');
        }else {
            errors.sub = {};
            for(let i in subtitles) {
                let start = subtitles[i].start;
                start = start ? parseFloat(start) : '';
                let end = subtitles[i].end;
                end = end ? parseFloat(end) : '';
                if(subtitles[i].start === undefined || subtitles[i].end === undefined || subtitles[i].full_mean === undefined || subtitles[i].raw_mean === undefined || subtitles[i].pronunciation === undefined) {
                    errors.sub[`sub_${i}`] = this.buildError(errors.sub, `sub_${i}`, 'Phụ đề không đúng định dạng dữ liệu');
                }else if(start == '' || end == '') {
                    if(start == '') {
                        errors.sub[`start_${i}`] = this.buildError(errors.sub, `start_${i}`, 'Giây bắt đầu không được để trống');
                    }
                    if(end == '') {
                        errors.sub[`end_${i}`] = this.buildError(errors.sub, `end_${i}`, 'Giây kết thúc không được để trống');
                    }
                }else if(isNaN(start) || isNaN(end)) {
                    if(isNaN(start)) {
                        errors.sub[`start_${i}`] = this.buildError(errors.sub, `start_${i}`, 'Giây bắt đầu phải là kiểu số');
                    }
                    if(isNaN(end)) {
                        errors.sub[`end_${i}`] = this.buildError(errors.sub, `end_${i}`, 'Giây kết thúc phải là kiểu số');
                    }
                }else if(start > duration || end > duration) {
                    if(isNaN(start)) {
                        errors.sub[`start_${i}`] = this.buildError(errors.sub, `start_${i}`, 'Giây bắt đầu quá thời lượng của video');
                    }
                    if(isNaN(end)) {
                        errors.sub[`end_${i}`] = this.buildError(errors.sub, `end_${i}`, 'Giây kết thúc quá thời lượng của video');
                    }
                }else {
                    if(start > end) {
                        errors.sub[`end_${i}`] = this.buildError(errors.sub, `end_${i}`, 'Giây kết thúc phải lớn hơn giây bắt đầu');
                    }else if(parseFloat(end) - parseFloat(start) < 0.29){
                        this.errors.sub[`end_${i}`] = ['Giây kết thúc phải lớn hơn giây bắt đầu 0.3 giây'];
                    }else if(subtitles[i - 1]) {
                        let pervious_start = subtitles[i - 1].start;
                        let pervious_end = subtitles[i - 1].end;
                        if(start <= pervious_start || start <= pervious_end) {
                            errors.sub[`start_${i}`] = this.buildError(errors.sub, `start_${i}`, 'Giây bắt đầu phải lớn hơn khoảng thời gian của phụ đề trước');
                        }
                        if(end <= pervious_start || end <= pervious_end) {
                            errors.sub[`end_${i}`] = this.buildError(errors.sub, `end_${i}`, 'Giây kết thúc phải lớn hơn khoảng thời gian của phụ đề trước');
                        }
                    }
                }
            }
            if(!Object.keys(errors.sub).length) {
                delete errors['sub']; 
            }
        }
        if (this.isError(errors)) {
            return this.sendRequestError(errors, res);
        }
        next();
    }
}

module.exports = VideoMiddleware;