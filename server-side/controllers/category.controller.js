const CategoryModel = require('../database/models/category.model');
const CommonService = require('../services/common.service');
const CacheService = require('../services/cache.service');
const AuthService = require('../services/auth.service');
const { sequelize, Sequelize } = require('sequelize');
const CategoryVideoModel = require('../database/models/category-video.model');
const CategoryNewsModel = require('../database/models/category-new.model');
const VideoModel = require('../database/models/video.model');
const Op = Sequelize.Op;

class CategoryController {

    /**
     * Get list resources
     * @param {*} req 
     * @param {*} res 
     */
    static async getList(req, res) {
        const { page, key_words } = req.query;
        if(key_words){
            const where = { 
                status: 'active',
                title: {[Op.like]: '%' +  key_words + '%'},
            };
            const order = [
                ['createdAt', 'DESC']
            ];
            const resource = { model: CategoryModel, req, where, order };
            const categories = await CommonService.paginate(resource);
            return res.send({ 'message' : 'Lấy danh sách danh mục thành công', 'data' : categories });
        }else{
            let categoryCache = await CacheService.getCache('categories');
            categoryCache = categoryCache ? categoryCache : {};
            if (!categoryCache[`categoryPage-${page}`]) {
                const where = { status: 'active' };
                const order = [
                    ['createdAt', 'DESC']
                ];
                const resource = { model: CategoryModel, req, where, order };
                categoryCache[`categoryPage-${page}`] = await CommonService.paginate(resource);
            }
            await CacheService.saveCache(categoryCache, 'categories');
            res.send({ 'message': 'Lấy danh sách danh mục thành công', 'data': categoryCache[`categoryPage-${page}`] });
        }
    }

    /**
     * Get all categories when create video, news
     * @param {*} req 
     * @param {*} res 
     */
    static async getAllCategories(req, res) {
        const categoryAll = await CategoryModel.findAll({
            where: {
                status: 'active',
            },
            order: [
                ['createdAt', 'ASC'],
            ],
        });
        res.send({ 'message': 'Lấy danh sách danh mục thành công', 'data': categoryAll });
    }

    /**
     * Create new resoucre
     * @param {*} req 
     * @param {*} res 
     */
    static async create(req, res) {
        // Init
        const { title, iconStr } = req.body;
        
        // Process
        const user = await AuthService.user(req);
        if (!user || user.account_type != 'ADMIN') {
            return res.status(403).send({ 'message': 'Tài khoản của bạn không có quyền thực hiện chức năng này!' })
        }
        const icon = iconStr ? await CommonService.uploadImage(iconStr) : '';
        const category = await CategoryModel.create({
            title,
            icon,
        });
        const slug = await CommonService.convertSlug(title);
        await category.update({
            slug: slug + '-' + category.id,
        });
        await CacheService.removeCache('categories');
        await CacheService.removeCache('videos');
        await CacheService.removeCache('news');
        res.send({ 'message': 'Tạo danh mục thành công' });
    }

    /**
     * Get Edit Data
     * @param {*} req 
     * @param {*} res 
     */
    static async getEdit(req, res) {
        // Init
        const { id } = req.params;

        // Process
        const user = await AuthService.user(req);
        if (!user || user.account_type != 'ADMIN') {
            return res.status(403).send({ 'message': 'Tài khoản của bạn không có quyền thực hiện chức năng này!' })
        }
        const category = await CategoryModel.findOne({ 
            where: { id, status: 'active' },
        });
        if(category){
            res.send({ 'message': 'Lấy dữ liệu danh mục thành công', 'data' : category });
        }else{
            res.status(404).send({ 'message' : 'Danh mục không tồn tại' });
        }
    }

    /**
     * Update Resource
     * @param {*} req 
     * @param {*} res 
     */
    static async edit(req, res) {
        // Init
        const { id } = req.params;
        const { title, iconStr } = req.body;

        // Process
        const user = await AuthService.user(req);
        if (!user || user.account_type != 'ADMIN') {
            return res.status(403).send({ 'message': 'Tài khoản của bạn không có quyền thực hiện chức năng này!' })
        }
        const category = await CategoryModel.findOne({ where: { id, status: 'active' } });
        if(category){
            const icon = iconStr ? await CommonService.uploadImage(iconStr) : category.icon;
            const slug = await CommonService.convertSlug(title);
            await category.update({
                title,
                icon,
                slug: slug + '-' + category.id,
            });
            await CacheService.removeCache('categories');
            await CacheService.removeCache('videos');
            await CacheService.removeCache('news');
            res.send({ 'message': 'Cập nhật danh mục thành công' });
        }else{
            res.status(404).send({ 'message' : 'Danh mục không tồn tại' });
        }
        
    }

    /**
     * Delete existed source
     * @param {*} req 
     * @param {*} res 
     */
    static async delete(req, res) {
        // Init
        const { id } = req.params;

        // Process
        const user = await AuthService.user(req);
        if (!user || user.account_type != 'ADMIN') {
            return res.status(403).send({ 'message': 'Tài khoản của bạn không có quyền thực hiện chức năng này!' })
        }
        const category = await CategoryModel.findOne({ where: { id } });
        if(category) {
            await category.update({
                status: 'deleted'
            });
            await CacheService.removeCache('categories');
            await CacheService.removeCache('videos');
            await CacheService.removeCache('news');
            res.send({ 'message': 'Xóa danh mục thành công' });
        }else{
            res.status(404).send({ 'message': 'Danh mục không tồn tại' });
        }
    }
}
module.exports = CategoryController;