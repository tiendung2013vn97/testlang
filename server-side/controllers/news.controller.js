const CommonService = require('../services/common.service');
const CacheService = require('../services/cache.service');
const AuthService = require('../services/auth.service');
const CategoryNewModel = require('../database/models/category-new.model');
const CategoryModel = require('../database/models/category.model');
const NewsModel = require('../database/models/news.model');
const { sequelize, Sequelize } = require('sequelize');
const Op = Sequelize.Op;

class NewController{

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
                title: {[Op.like]: '%' +  key_words + '%'},
                createdBy: {[Op.like]: '%' +  key_words + '%'},
            };
            const order = [
                ['createdAt', 'DESC']
            ];
            const include = [
                {
                    model: CategoryModel,
                    where: { status: 'active' },
                    required: false,
                },
            ];
            const resource = { model: NewsModel, req, where, order, include };
            const news = await CommonService.paginate(resource);
            return res.send({ 'message' : 'Lấy danh sách bài viết thành công', 'data' : news });
        }else{
            let newCache = await CacheService.getCache('news');
            newCache = newCache ? newCache : {};
            if (!newCache[`newPage-${page}`]) {
                const where = {
                    status: { [Op.not]: 'deleted' },
                };
                const order = [
                    ['createdAt', 'DESC']
                ];
                const include = [
                    {
                        model: CategoryModel,
                        where: { status: 'active' },
                        required: false,
                    },
                ];
                const resource = { model: NewsModel, req, where, order, include };
                newCache[`newPage-${page}`] = await CommonService.paginate(resource);
            }
            await CacheService.saveCache(newCache, 'news');
            res.send({ 'message': 'Lấy danh sách bài viết thành công', 'data': newCache[`newPage-${page}`] });
        }
    }

    /**
     * Create new resource
     * @params req, res
     * @return {void}
     */
    static async create(req, res) {
        // Init
        const { title, description, imageStr, content, createdBy, categories } = req.body;
        // Process
        const user = await AuthService.user(req);
        if(!user || user.account_type != "ADMIN"){
            return res.status(403).send({ 'message': 'Tài khoản của bạn không có quyền thực hiện chức năng này!' });  
        }
        const image = imageStr ? await CommonService.uploadImage(imageStr) : '';
        const news = await NewsModel.create({
            title,
            content,
            image,
            description,
            createdBy
        });
        let slug = await CommonService.convertSlug(title);
        slug = `${slug}-${news.id}`;
        await news.update({
            slug,
        })
        for(let i in categories){
            let category = categories[i];
            if(category.id) {
                await CategoryNewModel.create({
                    new_id: news.id,
                    category_id: category.id,
                })
            }
        }
        await CacheService.removeCache('news');
        await CacheService.removeCache('categories');
        res.send({ 'message' : 'Tạo bài viết mới thành công' });
    }

    /**
     * Update resource
     * @params req, res
     * @return {void}
     */
    static async update(req,res){
        const { id } = req.params;
        const { title, description, imageStr, content, createdBy, categories } = req.body;
        const user = await AuthService.user(req);

        let where = { id, status: { [Op.not]: 'deleted' } };
        if(!user || user.account_type != "ADMIN"){
            return res.status(403).send({ 'message':'Tài khoản của bạn không có quyền thực hiện chức năng này!' });
        }
        const news = await NewsModel.findOne({ where });
        if(news){
            let image = imageStr ? await CommonService.uploadImage(imageStr) : news.image;
            let slug = await CommonService.convertSlug(title);
            slug = `${slug}-${news.id}`;
            await news.update({
                title,
                description,
                content,
                createdBy,
                image,
                slug,
            });
            await CategoryNewModel.destroy({ where: { new_id: id } });
            for(let i in categories){
                let category = categories[i];
                await CategoryNewModel.create({
                    new_id: news.id,
                    category_id: category.id,
                })
            }
            await CacheService.removeCache('news');
            await CacheService.removeCache('categories');
            res.send({ 'message':'Cập nhật tin tức thành công' });
        }else{
            res.status(404).send({ 'message': 'Tin tức này này không tồn tại' });
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
        let where = { id, status: { [Op.not]:'deleted' } };
        if(!user || user.account_type != "ADMIN"){
            return res.status(403).send({'message':'Tài khoản của bạn không có quyền thực hiện chức năng này!'});
        }
        const news = await NewsModel.findOne({ where });
        if(news){
            await news.update({
                status: 'deleted',
            });
            await CacheService.removeCache('news');
            await CacheService.removeCache('categories');
            res.send({ 'message':'Xóa tin tức thành công' });
        }else{
            res.status(404).send({ 'message':'Tin tức này không tồn tại' });
        }
    }

    /**
     * Get data edit resource
     * @params req, res
     * @return {void}
     */
    static async edit(req,res){
        const {id} = req.params;
        const user = await AuthService.user(req);
        let where = { id, status: { [Op.not]:'deleted' } };
        if(!user || user.account_type != "ADMIN"){
            return res.status(403).send({ 'message':'Tài khoản của bạn không có quyền thực hiện chức năng này!' });
        }
        const news = await NewsModel.findOne({ 
            where,
            include: [{
                model: CategoryModel,
                where: { status: 'active' },
                required: false,
            }]
        });
        if(news){
            res.send({ 'message':'Lấy dữ liệu tin tức thành công', 'data' : news });
        }else{
            res.status(404).send({ 'message' : 'Tin tức này không tồn tại' });
        }
    }
}
module.exports = NewController;