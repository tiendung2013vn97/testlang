const UserModel = require('../database/models/user.model');
const passport = require('passport');
const Middleware = require('./middleware');
const FieldsMiddleware = require('./fields.middleware');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const moment = require('moment');
const axios = require("axios");
const AuthController=require("../controllers/auth.controller")

/**
* This middleware validates authenticate user by JWT header.
*/
exports.accessToken = passport.authenticate('jwt', { session: false });

class AuthMiddleware extends Middleware {
    /**
    * Validate register request
    */
    static async login(req, res, next) {
        const { email, password,type="default",accessToken,facebook_id } = req.body;
        const errors = {};
        let validation
        switch (type) {
            case "facebook":{
                validation=[ 
                    { facebook_id,accessToken }, 
                    [ 
                        'facebook_id','accessToken'
                    ],
                    [ 
                        'Facebook id không được để trống',,
                        'AccessToken không được để trống',
                    ]]
                break
            }
            case "google":{
                validation=[ 
                    { accessToken }, 
                    [ 
                        'accessToken'
                    ],
                    [ 
                        'AccessToken không được để trống'
                    ]]
                break
            }
            default:
                validation=[ 
                    { email, password }, 
                    [ 
                        'email',
                        'password'
                    ],
                    [ 
                        'Email không được để trống', 
                        'Mật khẩu không được để trống',
                    ]]
                break;
        }
        const required = FieldsMiddleware.checkRequired(...validation);

        if (required) {
            return this.sendRequestError(required, res);
        }

        if(type=="facebook"){
            try {
                let profile=await axios.get(`https://graph.facebook.com/${facebook_id}?fields=id,name,picture.type(large)`,{ headers: { 
                    Authorization: `Bearer ${accessToken}` 
                }})
                profile=profile.data
                req.body.facebook_id=profile.id
                req.body.username=profile.name
                req.body.avatar=profile.picture.data.url

            } catch (error) {
                console.log("error",error)
                return res.status(403).send({ 'message' : 'Facebook access token không hợp lệ' });
            }
        }

        if(type=="google"){
            try {
                let profile=await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json`,{ headers: { 
                    Authorization: `Bearer ${accessToken}` 
                }})
                profile=profile.data
                req.body.google_id=profile.id
                req.body.email=profile.email
                req.body.username=profile.name
                req.body.avatar=profile.picture
            } catch (error) {
                return res.status(403).send({ 'message' : 'Google access token không hợp lệ' });
            }
        }

        if (type=="default"&&!validator.isEmail(email)) {
            errors.email = this.buildError(errors, 'email', 'Email không đúng định dạng');
        }else{
            let user
            switch (type) {
                case "facebook":
                    user= await UserModel.findOne({ where: { facebook_id: req.body.facebook_id } });
                    break;
                case "google":
                    user= await UserModel.findOne({ where: { google_id:req.body.google_id } });
                    break;            
                default:
                    user = await UserModel.findOne({ where: { email } });
                    break;
            }
            if (!user) {
                if(type=="default") errors.user = this.buildError(errors, 'user', 'User này không tồn tại trong hệ thống');
                else {
                    return AuthController.createFacebookOrGoogleUser(res, req.body.facebook_id||req.body.google_id,req.body.username,req.body.avatar,req.body.email||"",type)
                    
                }
            }else{
                if(user.status == 'banned'){
                    return res.status(403).send({ 'message' : 'Tài khoản này đang bị khóa' });
                }

                if(user.status == 'inactive'){
                    return res.status(403).send({ 'message' : 'Tài khoản này chưa được xác thực' })
                }
            }
            if (type=="default"&&user && !(await bcrypt.compare(password, user.password))) {
                errors.password = this.buildError(errors, 'password', 'Mật khẩu không chính xác');
            }
        }

        if (this.isError(errors)) {
            return this.sendRequestError(errors, res);
        }

        next();
    }

    /**
    * Validate register request
    */
    static async register(req, res, next) {
        const { email, password = '', username, 'password_c': confirmPassword } = req.body;
        const errors = {};
        const required = FieldsMiddleware.checkRequired(
            { email, password, username, 'password_c': confirmPassword },
            [ 
                'email',
                'password',
                'username',
                'password_c',
            ],
            [ 
                'Email không được bỏ trống', 
                'Mật khẩu không được bỏ trống',
                'Tên người dùng không được bỏ trống',
                'Nhập lại mật khẩu không được bỏ trống',
            ]
        );

        if (required) {
            return this.sendRequestError(required, res);
        }

        if (!validator.isEmail(email)) {
            errors.email = this.buildError(errors, 'email', 'Email không đúng định dạng');
        }else{
            const userByEmail = await UserModel.findOne({ where: { email } });
            const userByUsername = await UserModel.findOne({ where: { username } });

            if (userByEmail) {
                errors.email = this.buildError(errors, 'email', 'Email này đã được sử dụng');
            }
        }
        if(validator.contains(password, " ")){
            errors.password = this.buildError(errors, 'password', 'Mật khẩu không được có khoảng trắng');
        }
        if (password !== confirmPassword) {
            errors.password_c = this.buildError(
                errors,
                'password_c',
                'Mật khẩu nhập lại không khớp'
            );
        }

        if (!validator.isLength(password, { min: 6 })) {
            errors.password = this.buildError(
                errors,
                'password',
                'Mật khẩu yêu cầu ít nhất 6 kí tự'
            );
        }

        if (this.isError(errors)) {
            return this.sendRequestError(errors, res);
        }

        next();
    }

    /**
    * Validate forgot password request
    */
    static async forgotPassword(req, res, next){
        const { email, password, c_password, token } = req.body;
        const errors = {};
        if(!token){
            const required = FieldsMiddleware.checkRequired(
                { email }, 
                [
                    'email',
                ],
                [ 
                    'Email không được để trống', 
                ]
            );

            if (required) {
                return this.sendRequestError(required, res);
            }

            if (!validator.isEmail(email)) {
                errors.email = this.buildError(errors, 'email', 'Email không đúng định dạng');
            }else{
                const user = await UserModel.findOne({ where: { email: email } });
                if (!user) {
                    errors.email = this.buildError(errors, 'email', 'Email này không tồn tại trong hệ thống');
                }
            }
        }else{
            let now = new moment().format();
            let user = await UserModel.findOne({ where: { forgot_token: token }});
            if(user){
                let expired = moment(user.updatedAt).add(12, 'hours').toISOString();
                if(now <= expired){
                    const required = FieldsMiddleware.checkRequired(
                        { password, c_password }, 
                        [
                            'password',
                            'c_password',
                        ],
                        [
                            'Mật khẩu không được bỏ trống',
                            'Nhập lại mật khẩu không được bỏ trống',
                        ]
                    );
        
                    if (required) {
                        return this.sendRequestError(required, res);
                    }
                    
                    if(validator.contains(password, " ")){
                        errors.password = this.buildError(errors, 'password', 'Mật khẩu không được có khoảng trắng');
                    }

                    if (password !== c_password) {
                        errors.c_password = this.buildError(
                            errors,
                            'c_password',
                            'Mật khẩu nhập lại không khớp'
                        );
                    }
        
                    if (!validator.isLength(password, { min: 6 })) {
                        errors.password = this.buildError(
                            errors,
                            'password',
                            'Mật khẩu yêu cầu ít nhất 6 kí tự'
                        );
                    }
                }else{
                    return res.status(404).send({'message': 'Link xác nhận quên mật khẩu hết hạn'});
                }
            }
        }

        if (this.isError(errors)) {
            return this.sendRequestError(errors, res);
        }
        next();
    }
}

exports.AuthMiddleware = AuthMiddleware;