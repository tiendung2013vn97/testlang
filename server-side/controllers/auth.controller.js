const UserModel = require('../database/models/user.model');
const JWTService = require('../services/jwt.service');
const ActiveTokenModel = require('../database/models/active-token.model');
const MailService = require('../services/mail.service');
const AuthService = require('../services/auth.service');
const bcrypt = require('bcryptjs');
const SettingModel = require('../database/models/setting.model');
const { OAuth2Client } = require('google-auth-library');
const UserSettingModel=require('../database/models/user-setting.model')
const moment = require('moment');

class AuthController {
    /**
     * Login user
     * @return {obj} token
     */
    static async login(req, res) {
        // Init
        const { email,type="default",facebook_id,facebook_name="",google_id,google_name } = req.body;
        let user 
        switch (type) {
            case "facebook":
                user= await UserModel.findOne({ where: { facebook_id } });
                break;
            case "google":
                user= await UserModel.findOne({ where: { google_id } });
                break;            
            default:
                user = await UserModel.findOne({ where: { email } });
                break;
        }
        const token = JWTService.generateTokenByUser(user);

        // Process
        let activeToken = await ActiveTokenModel.findOne({ where: { user_id: user.id } });

        if(!activeToken){
            activeToken = await ActiveTokenModel.create({ token, user_id: user.id });
        }else{
            let expired = moment(activeToken.updatedAt).add(7, 'days');
            let now = moment();
            if(expired < now || !JWTService.verifyToken(activeToken.token)){
                activeToken = await activeToken.update({ token })
            }
        }
        const data = activeToken.token;
        res.send({ token: data });
    }

    static async createFacebookOrGoogleUser(res,id,username,avatar,email,type="facebook"){
        const user = await UserModel.create({
            email,
            password: "",
            username,
            account_type: 'USER',
            status: 'active',
            facebook_id: type=="facebook"?id:null,
            google_id: type=="google"?id:null,
            avatar
        });

        const defaultUserSetting = {
            speed: 1,
            volume: 100,
            autoLoop: true,
            genRange: 3,
            isPlayAll: true,
            langStudy: {
                raw_lang: {
                    id: -1,
                    code: "any",
                    title: "Bất kì",
                    status: "active",
                },
                lang_trans: {
                    id: -1,
                    code: "any",
                    title: "Bất kì",
                    status: "active",
                },
            },
            resolution: 360,
            toSentence: 5,
            fromSentence: 4,
            isNormalPlay: true,
            isSingleLoop: false,
            repeatNumber: 1,
            isPlayFromRange: false,
        };
        await UserSettingModel.create({
            user_id: user.id,
            value: defaultUserSetting,
        });

        const token = JWTService.generateTokenByUser(user);
        
        // Process
        let activeToken = await ActiveTokenModel.findOne({ where: { user_id: user.id } });

        if(!activeToken){
            activeToken = await ActiveTokenModel.create({ token, user_id: user.id });
        }else{
            let expired = moment(activeToken.updatedAt).add(7, 'days');
            let now = moment();
            if(expired < now || !JWTService.verifyToken(activeToken.token)){
                activeToken = await activeToken.update({ token })
            }
        }

        const data = activeToken.token;
        res.send({ token: data });
    }

    /**
     * Register user
     * @return {obj} message
     */
    static async register(req, res) {
        // Init
        const { email, password, username, url } = req.body;
        const { USER_PASSWORD_SALT_ROUNDS: saltRounds = 10 } = process.env;
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
        const passwordHash = await bcrypt.hash(password, +saltRounds);
        // Process
        let mail_token = '';
        for (let i = 0; i < 15; i++) {
            let random = (Math.random() * (charset.length - 1 - 0) + 0) | 0;

            mail_token += charset[random];
        }

        const user = await UserModel.create({
            email,
            password: passwordHash,
            username,
            account_type: 'USER',
            status: 'inactive',
            mail_token: mail_token,
        });

        const defaultUserSetting = {
            speed: 1,
            volume: 100,
            autoLoop: true,
            genRange: 3,
            isPlayAll: true,
            langStudy: {
                raw_lang: {
                    id: -1,
                    code: "any",
                    title: "Bất kì",
                    status: "active",
                },
                lang_trans: {
                    id: -1,
                    code: "any",
                    title: "Bất kì",
                    status: "active",
                },
            },
            resolution: 360,
            toSentence: 5,
            fromSentence: 4,
            isNormalPlay: true,
            isSingleLoop: false,
            repeatNumber: 1,
            isPlayFromRange: false,
        };
        await UserSettingModel.create({
            user_id: user.id,
            value: defaultUserSetting,
        });

        const token = JWTService.generateTokenByUser(user);
        const msg = {
            reciver: email,
            subject: 'Confirm registration!',
        }
        const template = {
            data: {
                username,
                url,
                mail_token,
            },
            type: 'register',
        }

        try {
            await MailService.sendMail(msg, template);
        } catch (error) {
            return res.status(500).send({ 'message': 'Có lỗi trong quá trình gửi mail xác nhận. Vui lòng thử lại sau!' });
        }
        
        await ActiveTokenModel.create({ token, user_id: user.id });
        res.send({ 'message': 'Đăng ký thành công, vui lòng kiểm tra email để xác nhận' });
    }

    /**
     * Confirm User Registration after they click link in mail
     * @param: token
     * @return: {void} json
     */
    static async confirmRegister(req, res) {
        // Init
        const { mail_token } = req.body;
        const user = await UserModel.findOne({ where: { mail_token: mail_token } });
        // Process

        if(!user || !mail_token){
            res.status(404).send({ 'message': 'Link xác nhận không tồn tại' });
        }else if(user && user.status == 'active'){
            res.status(403).send({ 'message': 'Tài khoản này đã xác nhận! Đăng nhập để tiếp tục' });
        }else if (user && user.status == 'inactive') {
            const token = JWTService.generateTokenByUser(user);
            const activeToken = await ActiveTokenModel.findOne({ where: { user_id: user.id } });
            (activeToken && (await activeToken.update({ token }))) ||
            (await ActiveTokenModel.create({ token, user_id: user.id }));
            user.update({
                status: 'active',
                mail_token: null,
            });
            res.send({ 'message': 'Xác nhận đăng kí tài khoản thành công! Tài khoản đã được đăng nhập', 'token': token });
        }
    }

    /**
     * Request forgot password or confirm action
     * @return: {voide} json
     */
    static async forgotPassword(req, res) {
        // Init
        const { email, url, password, token } = req.body;
        const { USER_PASSWORD_SALT_ROUNDS: saltRounds = 10 } = process.env;
        if (!token) {
            const user = await UserModel.findOne({ where: { email: email } });
            const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
            let forgot_token = '';
            for (let i = 0; i < 15; i++) {
                let random = (Math.random() * (charset.length - 1 - 0) + 0) | 0;

                forgot_token += charset[random];
            }
            user.update({
                forgot_token: forgot_token
            });
            const msg = {
                reciver: email,
                subject: 'Reset password!',
            }
            const template = {
                data: {
                    username: user.username,
                    url,
                    forgot_token,
                },
                type: 'forgot password',
            }
            try {
                await MailService.sendMail(msg, template);
            } catch (error) {
                return res.status(500).send({ 'message': 'Có lỗi trong quá trình gửi mail xác nhận. Vui lòng thử lại sau!' });
            }
 
            res.send({ 'message': 'Yêu cầu thành công! Vui lòng kiểm tra mail để xác nhận' });
        } else {
            const user = await UserModel.findOne({ where: { forgot_token: token } });
            if(!user){
                return res.status(403).send({ 'message': 'Yêu cầu quên mật khẩu không tồn tại hoặc hết hạn. Vui lòng thử lại!' });
            }else {
                const tokenUser = JWTService.generateTokenByUser(user);
                let activeToken = await ActiveTokenModel.findOne({ where: { user_id: user.id } });
                if(!activeToken){
                    await activeToken.create({ 
                        user_id: user.id,
                        token: tokenUser,
                    });
                }else{
                    await activeToken.update({ 
                        token: tokenUser,
                    });
                }
    
                const passwordHash = await bcrypt.hash(password, +saltRounds);
                user.update({
                    password: passwordHash,
                    forgot_token: null,
                });
                res.send({ 'message': 'Thay đổi mật khẩu thành công!' });
            }
        }
    }

    /**
     * Function to login with facebook successfully
     * @return: {token | string} 
     */
    static async loginFacebook(req, res) {
        const { email, name, id, picture } = req.body;
        const user = await UserModel.findOne({ where: { email } });
        if (user) {
            let token = JWTService.generateTokenByUser(user);

            // Process
            const activeToken = await ActiveTokenModel.findOne({ where: { user_id: user.id } });

            (activeToken && (await activeToken.update({ token }))) ||
            (await ActiveTokenModel.create({ token, user_id: user.id }));

            res.send({ token });
        } else {
            let new_user = await UserModel.create({
                email,
                username: name,
                status: 'active',
                account_type: 'USER',
                facebook_id: id,
                avatar: picture,
            });

            let token = JWTService.generateTokenByUser(new_user);
            await ActiveTokenModel.create({ token, user_id: new_user.id });

            const activeToken = await ActiveTokenModel.findOne({ where: { user_id: new_user.id } });

            (activeToken && (await activeToken.update({ token }))) ||
            (await ActiveTokenModel.create({ token, user_id: new_user.id }));
            res.send({ 'message': 'Đăng nhập thành công!', 'token': token });
        }
    }

    /**
     * Function to get CLIENT_ID of google/facebook
     * @param {*} req 
     * @param {*} res 
     * @return { object | string }
     */
    static async getClientId(req, res) {
        var accept = ['google_client_id', 'facebook_client_id'];
        const key = (req.query.id).trim();
        const setting = await SettingModel.findOne({ where: { key } });
        if (setting && accept.includes(key)) {
            let data = setting.value;
            return res.send({ data });
        }
        return res.send({ 'message': 'Không tìm thấy cài đặt' });
    }

    /**
     * Verify id_token and return user info
     * @param {*} req 
     * @param {*} res 
     * @return { object }
     */
    static async verify(req, res) {
        const key = 'google_client_id';
        const setting = await SettingModel.findOne({ where: { key } });
        if (setting) {
            let CLIENT_ID = setting.value;
            const client = new OAuth2Client(CLIENT_ID);
            const ticket = await client.verifyIdToken({
                idToken: req.query.token,
                audience: CLIENT_ID,
            });
            const payload = ticket.getPayload();
            return res.send({ payload })
        } else
            return res.send({ 'message': 'Không tìm thấy cài đặt' });
    }

    /**
     * Function login with google
     * @param {*} req 
     * @param {*} res 
     * @return token
     */
    static async loginGoogle(req, res) {
        const { email, name, id, picture } = req.body;
        const user = await UserModel.findOne({ where: { email } });
        if (user) {
            let token = JWTService.generateTokenByUser(user);

            // Process
            const activeToken = await ActiveTokenModel.findOne({ where: { user_id: user.id } });

            (activeToken && (await activeToken.update({ token }))) ||
            (await ActiveTokenModel.create({ token, user_id: user.id }));

            res.send({ token });
        } else {
            let new_user = await UserModel.create({
                email,
                username: name,
                status: 'active',
                google_id: id,
                account_type: 'USER',
                avatar: picture,
            });


            let token = JWTService.generateTokenByUser(new_user);
            await ActiveTokenModel.create({ token, user_id: new_user.id });

            const activeToken = await ActiveTokenModel.findOne({ where: { user_id: new_user.id } });

            (activeToken && (await activeToken.update({ token }))) ||
            (await ActiveTokenModel.create({ token, user_id: new_user.id }));
            res.send({ 'message': 'Đăng nhập thành công!', 'token': token });
        }
    }

    /**
    * Check then if current token is correct
    * @return {void}
    */
    static async checkTokenInfo(req, res) {
        // Process
        let user = await AuthService.user(req);
        
        let activeToken = user.id ? await ActiveTokenModel.findOne({ where: { user_id: user.id } }) : '';
        activeToken = activeToken ? activeToken.token : '';

        if(!activeToken || !JWTService.verifyToken(activeToken)){
            res.status(403).send({ 'message' : 'Thông tin đăng nhập không chính xác' });
        }else{
            res.send({ 'message' : 'Thông tin đăng nhập chính xác', 'token' : activeToken });
        }
    }
}

module.exports = AuthController;