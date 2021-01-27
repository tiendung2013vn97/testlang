const passport = require('passport');
const Middleware = require('./middleware');
const FieldsMiddleware = require('./fields.middleware');
const validator = require('validator');

class SettingMiddleware extends Middleware {
    /**
    * Middleware Validate Request Transfer
    */
    static async updateSetting(req, res, next) {
        const { type } = req.query;
        if(type == 'mail'){
            const { mail_host, mail_port, mail_username, mail_password } = req.body;
            const errors = {};
            const required = FieldsMiddleware.checkRequired({ mail_host, mail_port, mail_username, mail_password }, 
                [
                    'mail_host',
                    'mail_port',
                    'mail_username',
                    'mail_password',
                ],
                [ 
                    'Mail host không được để trống',
                    'Mail port không được để trống',
                    'Tên user không được để trống',
                    'Mật khẩu không được để trống',
                ]
            );
            if (required) {
                return this.sendRequestError(required, res);
            }
        }

        if(type == 'languages'){
            const { raw_lang, lang_trans } = req.body;
            const errors = {};
            const required = FieldsMiddleware.checkRequired({ raw_lang, lang_trans }, 
                [
                    'raw_lang',
                    'lang_trans',
                ],
                [ 
                    'Ngôn ngữ học không được để trống',
                    'Ngôn ngữ dịch không được để trống',
                ]
            );
            if (required) {
                return this.sendRequestError(required, res);
            }
            if (raw_lang.id == lang_trans.id){
                errors.lang_trans = this.buildError(errors, 'lang_trans', 'Ngôn ngữ dịch không được trùng với ngôn ngữ học');
            }
            
            if (this.isError(errors)) {
                return this.sendRequestError(errors, res);
            }
        }

        if(type == 'more'){
            const { more_commission, more_withdrawal_fee } = req.body;
            const errors = {};
            const required = FieldsMiddleware.checkRequired({ more_commission, more_withdrawal_fee }, 
                [
                    'more_commission',
                    'more_withdrawal_fee',
                ],
                [ 
                    'Phí hoa hồng không được để trống',
                    'Phí rút tiền không được để trống',
                ]
            );
            if (required) {
                return this.sendRequestError(required, res);
            }
            if (isNaN(more_commission)){
                errors.more_commission = this.buildError(errors, 'more_commission', 'Phí hoa hồng phải là kiểu số');
            }
            if (more_commission < 0 || more_commission > 100){
                errors.more_commission = this.buildError(errors, 'more_commission', 'Phí % hoa hồng phải từ 0-100');
            }
            if (isNaN(more_withdrawal_fee)){
                errors.more_withdrawal_fee = this.buildError(errors, 'more_withdrawal_fee', 'Phí rút tiền phải là kiểu số');
            }
            if (more_withdrawal_fee < 0){
                errors.more_withdrawal_fee = this.buildError(errors, 'more_withdrawal_fee', 'Phí rút tiền phải lớn hơn hoặc bằng 0');
            }
            if (this.isError(errors)) {
                return this.sendRequestError(errors, res);
            }
        }

        // Google & FB client_id are required to display the login button in addition to frontend
        if(type == 'social'){
            const { google_client_id, facebook_client_id } = req.body;
            const required = FieldsMiddleware.checkRequired({ google_client_id, facebook_client_id }, 
                [
                    'google_client_id',
                    'facebook_client_id',
                ],
                [ 
                    'ID client không được để trống',
                    'App ID không được để trống',
                ]
            );

            if (required) {
                return this.sendRequestError(required, res);
            }
        }
        // End
        next();
    }
}

module.exports = SettingMiddleware;