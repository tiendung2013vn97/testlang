const Middleware = require('./middleware');
const FieldsMiddleware = require('./fields.middleware');
const validator = require('validator');

class LangsMiddleware extends Middleware {

    /**
     * Validate Create and Update resource
     */
    static async createAndUpdate(req, res, next){
        // Init
        const { words, translate, lang_trans, trans_lang } = req.body;
        const { type } = req.query;
        let requireStr = "";
        if(type == "pronoun"){
            requireStr = "Phiên âm";
        }else if(type == "full_line"){
            requireStr = "Dịch cả câu";
        }else if(type == "word"){
            requireStr = "Dịch từng từ";
        }
        const errors = {};
        // Processs
        let required = FieldsMiddleware.checkRequired(
            { words, translate },
            [
                'words',
                'translate',
            ], 
            [
                'Từ vựng không được để trống',
                requireStr + ' không được để trống',
            ]
        );
        required = required ? required : {};
        if(lang_trans == null || lang_trans.length == 0){
            required.lang_trans = [ 'Vui lòng chọn ít nhất 1 ngôn ngữ' ];
        }
        if(trans_lang == null || trans_lang.length == 0){
            required.trans_lang = [ 'Vui lòng chọn ít nhất 1 ngôn ngữ' ];
        }
        if(Object.keys(required).length) {
            return this.sendRequestError(required, res);
        }
        if(lang_trans.id == trans_lang.id){
            errors.trans_lang = this.buildError(errors, 'trans_lang', 'Ngôn ngữ dịch phải khác ngôn ngữ gốc');
        }
        if (this.isError(errors)) {
            return this.sendRequestError(errors, res);
        }
        next();
    }
}

module.exports = LangsMiddleware;