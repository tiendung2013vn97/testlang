const SettingModel = require('../database/models/setting.model');
const LangModel = require('../database/models/lang.model');
const CommonService = require('../services/common.service');
const AuthService = require('../services/auth.service');
const { sequelize, Sequelize } = require('sequelize');
const Op = Sequelize.Op;

class SettingController {

    /**
    * Get Setting Data By Type
    * @param {object} req
    * @param {object} res
    * @return {void}
    */
    static async getSetting(req, res){
        // Init
        const { type } = req.query;
        // Process
        const user = await AuthService.user(req);
        let data = {};
        // type : mail
        if(type == 'mail' && user){
            if(!user || user.account_type != 'ADMIN'){
                return res.status(403).send({ 'message' : 'Tài khoản của bạn không có quyền thực hiện chức năng này!' });
            }
            data.type = 'mail';
            data.mail_host = await this.getSettingValueByKey('mail_host');
            data.mail_port = await this.getSettingValueByKey('mail_port');
            data.mail_username = await this.getSettingValueByKey('mail_username');
            data.mail_password = await this.getSettingValueByKey('mail_password');
            return res.send({'message' : 'Lấy thông tin SMTP thành công!', data});
        }

        // type : languages
        if(type == 'languages'){
            data.type = 'languages';
            let default_lang = await LangModel.findAll({ where: { status: 'active' }, limit: 2 });
            let raw_lang = await this.getSettingValueByKey('raw_lang');
            data.raw_lang = raw_lang ? JSON.parse(raw_lang) : default_lang.length == 2 ? default_lang[0] : '';
            let lang_trans = await this.getSettingValueByKey('lang_trans');
            data.lang_trans = lang_trans ? JSON.parse(lang_trans) : default_lang.length == 2 ? default_lang[1] : '';
            return res.send({'message' : 'Lấy thông tin ngôn ngữ thành công!', data});
        }

        // type : social
        if(type == 'social' && user){
            if(!user || user.account_type != 'ADMIN'){
                return res.status(403).send({ 'message' : 'Tài khoản của bạn không có quyền thực hiện chức năng này!' });
            }
            data.type = 'social';
            data.google_client_id = await this.getSettingValueByKey('google_client_id');
            data.google_secret_code = await this.getSettingValueByKey('google_secret_code');
            data.google_callback = await this.getSettingValueByKey('google_callback');
            data.facebook_client_id = await this.getSettingValueByKey('facebook_client_id');
            data.facebook_secret_code = await this.getSettingValueByKey('facebook_secret_code');
            data.facebook_callback = await this.getSettingValueByKey('facebook_callback');
            return res.send({ 'message' : 'Lấy thông tin social login thành công!', data}); 
        }

        if(type == 'sidebar'){
            data.type = 'sidebar';
            data.sidebar_area_1 = await this.getSettingValueByKey('sidebar_area_1');
            data.sidebar_area_1 = data.sidebar_area_1 ? JSON.parse(data.sidebar_area_1) : { posts: [] };
            return res.send({ 'message' : 'Lấy thông tin cài đặt sidebar thành công!', data}); 
        }

        // type : more
        if(type == 'more' && user){
            data.type = 'more';
            data.more_commission = await this.getSettingValueByKey('more_commission');
            data.more_withdrawal_fee = await this.getSettingValueByKey('more_withdrawal_fee');
            return res.send({'message' : 'Lấy thông tin cài đặt thêm thành công!', data});
        }else{
            return res.send({ 'message' : 'Không tìm thấy cài đặt' });
        } 
    }

    /**
    * Update Mail Smtp Setting
    * @param {object} req
    * @param {object} res
    * @return {void}
    */
    static async updateSetting(req, res){
        const { type } = req.query;
        const user = await AuthService.user(req);
        if(!user || user.account_type != 'ADMIN'){
            return res.status(403).send({ 'message' : 'Tài khoản của bạn không có quyền thực hiện chức năng này!' });
        }

        // type : mail
        if(type == 'mail'){
            const { mail_host, mail_port, mail_username, mail_password } = req.body;
            await this.updateSettingByKey('mail_host', mail_host);
            await this.updateSettingByKey('mail_port', mail_port);
            await this.updateSettingByKey('mail_username', mail_username);
            await this.updateSettingByKey('mail_password', mail_password);
            return res.send({ 'message' : 'Cập nhật SMTP thành công!' });
        }

        // type : languages
        if(type == 'languages'){
            const { raw_lang, lang_trans  } = req.body;
            await this.updateSettingByKey('raw_lang', JSON.stringify(raw_lang));
            await this.updateSettingByKey('lang_trans', JSON.stringify(lang_trans));
            return res.send({ 'message' : 'Cập nhật ngôn ngữ thành công!' });
        }

        // type : social
        if(type == 'social'){
            const { google_client_id, google_secret_code, google_callback, facebook_client_id, facebook_secret_code, facebook_callback } = req.body;
            await this.updateSettingByKey('google_client_id',google_client_id );
            await this.updateSettingByKey('google_secret_code', google_secret_code);
            await this.updateSettingByKey('google_callback', google_callback);
            await this.updateSettingByKey('facebook_client_id', facebook_client_id);
            await this.updateSettingByKey('facebook_secret_code', facebook_secret_code);
            await this.updateSettingByKey('facebook_callback', facebook_callback);
            return res.send({ 'message' : 'Cập nhật social login thành công!' }); 
        }

        if(type == 'sidebar'){
            let { sidebar_area_1 } = req.body;
            await this.updateSettingByKey('sidebar_area_1', JSON.stringify(sidebar_area_1));
            return res.send({ 'message' : 'Cài đặt sidebar cập nhật thành công!' }); 
        }

        if(type == 'more'){
            let { more_commission, more_withdrawal_fee } = req.body;
            await this.updateSettingByKey('more_commission', more_commission);
            await this.updateSettingByKey('more_withdrawal_fee', more_withdrawal_fee);
            return res.send({ 'message' : 'Cài đặt thêm cập nhật thành công!' }); 
        }

        else{
            return res.send({ 'message' : 'Không tìm thấy cài đặt' }); 
        }
    }

    /**
    * Get Setting Value By Key
    * @return setting value
    */
    static async getSettingValueByKey(key){
        const setting = await SettingModel.findOne({ where: {key: key} });
        if(setting){
            return setting.value;
        }
        return '';
    }

    /**
    * Update Setting Value By Key
    * @param {string} value
    * @return create or edit
    */
    static async updateSettingByKey(key , value){
        const setting = await SettingModel.findOne({ where: {key: key} });
        if(setting){
            setting.update({ 
                value: value 
            });
        }else{
            SettingModel.create({
                key: key, 
                value: value,
            });
        }
        return true;
    }
}

module.exports = SettingController;