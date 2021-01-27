const CommonService = require('../services/common.service');
const CacheService = require('../services/cache.service');
const AuthService = require('../services/auth.service');
const LangModel = require("../database/models/lang.model");
const { sequelize, Sequelize } = require('sequelize');
const Op = Sequelize.Op;

class LangController{
    /**
     * Get list resource with paginate
     * @param {*} req 
     * @param {*} res 
     */
    static async getList(req, res){
        const { page, key_words } = req.query;
        if(key_words){
            const where = {
                status: 'active',
                [Op.or]: [
                    { title: {[Op.like]: '%' +  key_words + '%'}},
                    { code: {[Op.like]: '%' +  key_words + '%'}},
                ]
            }
            const order = [
                ['createdAt', 'DESC']
            ];
            const resource = { model: LangModel, req, where, order };
            const lang = await CommonService.paginate(resource);
            return res.send({ 'message' : 'Lấy danh sách ngôn ngữ thành công', 'data' : lang });
        }else{
            let langCache = await CacheService.getCache('langs');
            langCache = langCache ? langCache : {};
            if (!langCache[`langPage-${page}`]) {
                const where = {
                    status: { [Op.not]: 'deleted' },
                };
                const order = [
                    ['createdAt', 'DESC']
                ];
                const resource = { model: LangModel, req, where, order };
                langCache[`langPage-${page}`] = await CommonService.paginate(resource);
            }
            await CacheService.saveCache(langCache, 'langs');
            res.send({ 'message': 'Lấy danh sách ngôn ngữ thành công', 'data': langCache[`langPage-${page}`] });
        }
    }

    /**
     * Get all languages when create or edit pronoun
     * @param {*} req 
     * @param {*} res 
     */
    static async getAllLanguages(req, res) {
        const languageAll = await LangModel.findAll({
            where: {
                status: 'active',
            },
            order: [
                ['createdAt', 'ASC'],
            ],
        });
        res.send({ 'message': 'Lấy danh sách ngôn ngữ thành công', 'data': languageAll });
    }

    /**
     * Create new resource
     * @params req, res
     * @return {void}
     */
    static async create(req, res) {
        const { title, code, imageStr, description } = req.body;
        const user = await AuthService.user(req);
        if(!user || user.account_type != "ADMIN"){
            return res.status(403).send({ 'message': 'Tài khoản của bạn không có quyền thực hiện chức năng này!' });
        }
        const langExist = await LangModel.findOne({
            where: {
                code,
                status: 'active',
            },
            required: true,
        });
        if(langExist){
            return res.status(403).send({ 'message': 'Đã tồn tại ngôn ngữ có mã code: ' + code });
        }
        const image = imageStr ? await CommonService.uploadImage(imageStr) : '';
        const lang = await LangModel.create({
            title,
            code,
            image,
            description,
        });
        await CacheService.removeCache('langs');
        res.send({ 'message' : 'Tạo ngôn ngữ mới thành công', lang });
    }

    /**
     * Get data edit resource
     * @params req, res
     * @return {void}
     */
    static async edit(req,res){
        const { id } = req.params;
        const user = await AuthService.user(req);
        if(!user || user.account_type != "ADMIN"){
            return res.status(403).send({ 'message':'Tài khoản của bạn không có quyền thực hiện chức năng này!' });
        }
        const lang = await LangModel.findOne({ 
            where: {
                id,
                status: { [Op.not]:'deleted' },
            }
        });
        if(lang){
            res.send({ 'message':'Lấy dữ liệu ngôn ngữ thành công', lang });
        }else{
            res.status(404).send({ 'message' : 'Ngôn ngữ này không tồn tại' });
        }
    }

    /**
     * Update resource
     * @params req, res
     * @return {void}
     */
    static async update(req,res){
        const { id } = req.params;
        const { title, code, imageStr, description } = req.body;
        const user = await AuthService.user(req);
        if(!user || user.account_type != "ADMIN"){
            return res.status(403).send({ 'message':'Tài khoản của bạn không có quyền thực hiện chức năng này!' });
        }
        const lang = await LangModel.findOne({
            where: { 
                id,
                status: { [Op.not]: 'deleted' },
            }
        });
        if(lang){
            let image = imageStr ? await CommonService.uploadImage(imageStr) : lang.image;
            await lang.update({
                title,
                code,
                image,
                description,
            });
            await CacheService.removeCache('langs');
            res.send({ 'message':'Cập nhật ngôn ngữ thành công', lang });
        }else{
            res.status(404).send({ 'message': 'Ngôn ngữ này không tồn tại' });
        }
        
    }

    /**
     * Delete resource
     * @params req, res
     * @return {void}
     */
    static async delete(req,res){
        const { id } = req.params;
        const user = await AuthService.user(req);
        if(!user || user.account_type != "ADMIN"){
            return res.status(403).send({'message':'Tài khoản của bạn không có quyền thực hiện chức năng này!'});
        }
        const lang = await LangModel.findOne({
            where: { 
                id,
                status: { [Op.not]:'deleted' },
            }
        });
        if(lang){
            await lang.update({
                status: 'deleted',
            });
            await CacheService.removeCache('langs');
            res.send({ 'message':'Xóa thành công ngôn ngữ ' + lang.title, lang });
        }else{
            res.status(404).send({ 'message':'Ngôn ngữ này không tồn tại' });
        }
    }
}
module.exports = LangController;