const UserModel = require('../database/models/user.model');
const UserSettingModel = require('../database/models/user-setting.model');
const ActiveTokenModel = require('../database/models/active-token.model');
const bcrypt = require('bcryptjs');
const JWTService = require('../services/jwt.service');
const { sequelize, Sequelize } = require('sequelize');
const CommonService = require('../services/common.service');
const CacheService = require('../services/cache.service');
const AuthService = require('../services/auth.service');
const Op = Sequelize.Op;
const constant=require("../util/common/constant")
const _=require("lodash")
const logger=require("../modules/logger");

class UserController {
    /**
     * Update Profile
     * @param {*} req 
     * @param {*} res 
     */
    static async updateProfile(req, res) {
        let user = await AuthService.user(req);
        const { username, phone, avatarStr, new_psw, isChangePsw } = await req.body;
        if(!user){
            return res.status(403).send({ 'message' : 'Thông tin đăng nhập không chính xác' });
        }
        let avatar = avatarStr ? await CommonService.uploadImage(avatarStr) : user.avatar;
        const { USER_PASSWORD_SALT_ROUNDS: saltRounds = 10 } = process.env;
        if(isChangePsw){
            const password = await bcrypt.hash(new_psw, +saltRounds);
            await user.update({
                password,
            });
        }
        user = await user.update({
            username,
            phone,
            avatar,
        });
        const token = JWTService.generateTokenByUser(user);
        const activeToken = await ActiveTokenModel.findOne({ where: { user_id: user.id } });
        await activeToken.update({ token });
        res.send({ 'message':'Cập nhật profile user thành công', token});
    }
    
    /**
     * Get info user detail
     * @param {*} req 
     * @param {*} res 
     */
    static async getDetailUser(req, res){
        const { id } = req.params;
        const admin = await UserModel.findOne({ where: { email: req.user.email } });
        if(admin.account_type != 'ADMIN'){
            return res.status(403).send({ 'message' : 'Bạn không có quyền thực hiện chức năng này' });
        }
        const user = await UserModel.findOne({ where: { id } });
        res.send({ user });
    }

    /**
     * Get all users
     * @param {*} req 
     * @param {*} res 
     */
    static async getListUser(req, res){
        const { page, key_words } = req.query;
        const user = await UserModel.findOne({ where: { email: req.user.email } });
        if(user.account_type != 'ADMIN'){
            return res.status(403).send({ 'message' : 'Bạn không có quyền thực hiện chức năng này' });
        }
        if(key_words){
            let where = {
                [Op.or]: [
                    {
                        email: {
                            [Op.like]: '%' + key_words + '%'
                        }
                    },
                    {
                        username: {
                            [Op.like]: '%' + key_words + '%'
                        }
                    }
                ]
            } 
            let attributes = ['id', 'username', 'email', 'phone', 'status', 'balance', 'account_type'];
            let resource = { model: UserModel, req, where, attributes };
            let users = await CommonService.paginate(resource);
            res.send({ 'message' : 'Lấy danh sách người dùng thành công', 'data' : users });
        }else {
            let userCache = await CacheService.getCache('users');
            userCache = userCache ? userCache : {};
            if(!userCache[`userPage-${page}`]){
                const where = { id: { [Op.gt]: 0 } };
                const attributes = ['id', 'username', 'email', 'phone', 'status', 'balance', 'account_type'];
                const resource = { model: UserModel, req, where, attributes };
                userCache[`userPage-${page}`] = await CommonService.paginate(resource);
            }
            await CacheService.saveCache(userCache, 'users');
            res.send({ 'message' : 'Lấy danh sách người dùng thành công', 'data' : userCache[`userPage-${page}`] });
        }
    }
    
    /**
     * Function block user
     * @param {*} req 
     * @param {*} res 
     */
    static async blockUser(req, res){
        const { id } = req.params;
        const isAdmin = await UserModel.findOne({ where: { email: req.user.email } });
        if(isAdmin.account_type != 'ADMIN'){
            return res.status(403).send({ 'message' : 'Bạn không có quyền thực hiện chức năng này' });
        }
        const user = await UserModel.findOne({ where: { id } });
        if(!user){
            return res.status(404).send({ 'message' : 'Tài khoản không tồn tại' });
        }else{
            if(user.id == isAdmin.id){
                return res.status(403).send({ 'message' : 'Tài khoản admin không thể bị block' });
            }else if(user.status == 'banned'){
                return res.status(403).send({ 'message' : 'Tài khoản này đã bị khóa' });
            }
        }
        await user.update({
            status: 'banned'
        });
        let token = await JWTService.generateTokenByUser(user);
        const activeToken = await ActiveTokenModel.findOne({ where: { user_id: user.id } });
        activeToken.update({ token });
        await CacheService.removeCache('users');
        res.send({ 'message': 'Khóa tài khoản thành công', token });
    }

    /**
     * Function unblock user
     * @param {*} req 
     * @param {*} res 
     */
    static async unblockUser(req, res) {
        const { id } = req.params;
        const isAdmin = await UserModel.findOne({ where: { email: req.user.email } });
        if(isAdmin.account_type != 'ADMIN'){
            return res.status(403).send({ 'message' : 'Bạn không có quyền thực hiện chức năng này' });
        }
        const user = await UserModel.findOne({ where: { id } });
        if(!user){
            return res.status(404).send({ 'message' : 'Tài khoản không tồn tại' });
        }else if(user && user.status == 'active'){
            return res.status(403).send({ 'message' : 'Tài khoản này đã kích hoạt' });
        }
        await user.update({
            status: 'active'
        });
        await CacheService.removeCache('users');
        res.send({ 'message': 'Mở khóa tài khoản thành công'});
    }

    /**
     * Switch type of user
     * @param {*} req 
     * @param {*} res 
     */
    static async switchType(req, res) {
      const { id } = req.params;
      const isAdmin = await UserModel.findOne({ where: { email: req.user.email } });
      if(isAdmin.account_type != 'ADMIN'){
          return res.status(403).send({ 'message' : 'Bạn không có quyền thực hiện chức năng này' });
      }
      const user = await UserModel.findOne({ where: { id } });
      if(!user){
          return res.status(404).send({ 'message' : 'Tài khoản không tồn tại' });
      }else {
        let account_type
        switch (user.account_type) {
          case "USER":
            account_type="PROVIDER"
            break;
          case "PROVIDER":
            account_type="ADMIN"
            break;    
          case "ADMIN":
            account_type="USER"
            break;                 
          default:
            break;
        }
  
        await user.update({
          account_type
        });
        await CacheService.removeCache('users');
        res.send({ message: `Đã chuyển loại tài khoản sang ${account_type}`});
      }
  }

    /**
     * Get user settings
     * @param {*} req 
     * @param {*} res 
     */
    static async getUserSettings(req,res){
        try {
            let user = await AuthService.user(req);
            if(!user) return res.status(403).send({ 'message' : 'Thông tin đăng nhập không chính xác' });
    
            let userId=user.account_type=="ADMIN"&&req.userId!=undefined?+req.userId:+user.id
            if(!Number.isInteger(userId)) return res.status(404).send({ 'message' : 'UserId phải là 1 số nguyên' });
            let userSetting=await UserSettingModel.findOne({where:{user_id:userId},raw:true})
            if(!userSetting)return res.status(404).send({ 'message' : 'Không có thông tin user settings cho tài khoản này!' });
            res.send(userSetting)
        } catch (error) {
            logger.error("getUserSettings failed!",error)
            res.status(500).send({message:constant.ERROR_500_MSG})
        }
    }
    
    /**
     * Update user settings
     * @param {*} req 
     * @param {*} res 
     */
    static async updateUserSettings(req,res){
        try {
      
            let user = await AuthService.user(req);
            if(!user) return res.status(403).send({ 'message' : 'Thông tin đăng nhập không chính xác' });
    
            let userId=user.account_type=="ADMIN"&&req.userId!=undefined?+req.userId:+user.id
            if(!Number.isInteger(userId)) return res.status(404).send({ 'message' : 'UserId phải là 1 số nguyên' });
            let userSetting=await UserSettingModel.findOne({where:{user_id:userId},raw:true})
            if(!userSetting)return res.status(404).send({ 'message' : 'Không có thông tin user settings cho tài khoản này!' });

            delete req.body.userId
            let updateObj=Object.assign(userSetting.value,req.body)
            await UserSettingModel.update({value:updateObj},{where:{
                user_id:userId
            }})
            
            res.send({
                message:"Cập nhập thông tin user settings thành công!",
                data:updateObj
            })
        } catch (error) {
            logger.error("updateUserSettings failed!",error)
            res.status(500).send({message:constant.ERROR_500_MSG})
        }
    }
}

module.exports = UserController;
