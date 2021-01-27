const Middleware = require('./middleware');
const FieldsMiddleware = require('./fields.middleware');
const UserModel = require('../database/models/user.model');
const AuthService = require('../services/auth.service');
const bcrypt = require('bcryptjs');
const validator = require('validator');

class UserMiddleware extends Middleware {

    /**
     * Middleware update profile
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    static async updateProfile(req, res, next) {
        const { username, new_psw, confirm_psw, current_psw, isChangePsw }  = req.body;
        const user = await AuthService.user(req);
        const errors = {};
        let required_other = {};
        let required_pass = {};

         // Process
        required_other = FieldsMiddleware.checkRequired(
            { username },
            [
                'username',
            ],
            [
                'Tên không được để trống',
            ]
        );
        if(isChangePsw){
            required_pass = FieldsMiddleware.checkRequired(
                { current_psw, new_psw, confirm_psw },
                [
                    'current_psw',
                    'new_psw',
                    'confirm_psw'
                ],
                [
                    'Mật khẩu hiện tại không được để trống',
                    'Mật khẩu mới không được để trống',
                    'Xác nhận mật khẩu mới không được để trống'
                ]
            );
        }
        let required = {...required_other, ...required_pass};
        if(Object.keys(required).length){
            return this.sendRequestError(required, res);
        }
        if(user && isChangePsw){
            if(!(await bcrypt.compare(current_psw, user.password))){
                errors.current_psw = this.buildError(errors, 'current_psw', 'Mật khẩu hiện tại không chính xác');
            }
            if (!validator.isLength(new_psw, { min: 6 })) {
                errors.new_psw = this.buildError(errors,'new_psw', 'Mật khẩu mới yêu cầu ít nhất 6 kí tự');
            }
            if(validator.contains(new_psw, " ")){
                errors.new_psw = this.buildError(errors, 'new_psw', 'Mật khẩu mới không được có khoảng trắng');
            }
            if(confirm_psw!=new_psw){
                errors.confirm_psw = this.buildError(errors, 'confirm_psw','Xác nhận mật khẩu mới không đúng');
            }
        }
        if (this.isError(errors)) {
            return this.sendRequestError(errors, res);
        }
        next();
    }
}

module.exports = UserMiddleware;