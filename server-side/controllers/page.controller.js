const CommonService = require('../services/common.service');
const CacheService = require('../services/cache.service');
const AuthService = require('../services/auth.service');
const PageModel = require('../database/models/pages.model');
const { sequelize, Sequelize } = require('sequelize');
const Op = Sequelize.Op;

class PageController{
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
            };
            const order = [
                ['createdAt', 'DESC']
            ];
            const resource = { model: PageModel, req, where, order };
            const pages = await CommonService.paginate(resource);
            return res.send({ 'message' : 'Lấy danh sách trang bài viết thành công', 'data' : pages });
        }else{
            let postCache = await CacheService.getCache('pages');
            postCache = postCache ? postCache : {};
            if (!postCache[`postPage-${page}`]) {
                const where = {
                    status: { [Op.not]: 'deleted' },
                };
                const order = [
                    ['createdAt', 'DESC']
                ];
                const resource = { model: PageModel, req, where, order };
                postCache[`postPage-${page}`] = await CommonService.paginate(resource);
            }
            await CacheService.saveCache(postCache, 'pages');
            res.send({ 'message': 'Lấy danh sách trang bài viết thành công', 'data': postCache[`postPage-${page}`] });
        }
    }

    /**
     * Create new resource
     * @params req, res
     * @return {void}
     */
    static async create(req, res) {
        // Init
        const { title, content, seo_title, seo_content, seo_keywords, seo_imageStr } = req.body;
        // Process
        const user = await AuthService.user(req);
        if(!user || user.account_type != "ADMIN"){
            return res.status(403).send({ 'message': 'Tài khoản của bạn không có quyền thực hiện chức năng này!' });  
        }
        let seo_image = seo_imageStr ? await CommonService.uploadImage(seo_imageStr) : '';
        const pages = await PageModel.create({
            title,
            content,
            seo_title,
            seo_content,
            seo_keywords,
            seo_image,
        });
        let slug = await CommonService.convertSlug(title);
        slug = `${slug}-${pages.id}`;
        await pages.update({
            slug,
        })
        await CacheService.removeCache('pages');
        res.send({ 'message' : 'Tạo trang bài viết mới thành công' });
    }

    /**
     * Update resource
     * @params req, res
     * @return {void}
     */
    static async update(req,res){
        const { id } = req.params;
        const { title, content, seo_title, seo_content, seo_keywords, seo_imageStr } = req.body;
        const user = await AuthService.user(req);

        let where = { id, status: { [Op.not]: 'deleted' } };
        if(!user || user.account_type != "ADMIN"){
            return res.status(403).send({ 'message':'Tài khoản của bạn không có quyền thực hiện chức năng này!' });
        }
        const pages = await PageModel.findOne({ where });
        if(pages){
            let seo_image = seo_imageStr ? await CommonService.uploadImage(seo_imageStr) : pages.seo_image;
            let slug = await CommonService.convertSlug(title);
            slug = `${slug}-${pages.id}`;
            await pages.update({
                title,
                content,
                seo_title,
                seo_content,
                seo_keywords,
                seo_image,
                slug,
            });
            await CacheService.removeCache('pages');
            res.send({ 'message':'Cập nhật trang bài viết thành công' });
        }else{
            res.status(404).send({ 'message': 'Trang bài viết này này không tồn tại' });
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
        const pages = await PageModel.findOne({ where });
        if(pages){
            await pages.update({
                status: 'deleted',
            });
            await CacheService.removeCache('pages');
            res.send({ 'message':'Xóa trang bài viết thành công' });
        }else{
            res.status(404).send({ 'message':'Trang bài viết này không tồn tại' });
        }
    }

    /**
     * Get data edit resource
     * @params req, res
     * @return {void}
     */
    static async edit(req,res){
        const { id } = req.params;
        const user = await AuthService.user(req);
        let where = { id, status: { [Op.not]:'deleted' } };
        if(!user || user.account_type != "ADMIN"){
            return res.status(403).send({ 'message':'Tài khoản của bạn không có quyền thực hiện chức năng này!' });
        }
        const pages = await PageModel.findOne({ 
            where,
        });
        if(pages){
            res.send({ 'message':'Lấy dữ liệu trang bài viết thành công', 'data' : pages });
        }else{
            res.status(404).send({ 'message' : 'Trang bài viết này không tồn tại' });
        }
    }

    /**
     * Get data resource
     * @params req, res
     * @return {void}
     */
    static async getDetailPage(req,res){
        let { slug } = req.params;
        // slug=encodeURIComponent(slug)
        let where = { slug, status: { [Op.not]:'deleted' } };
        const pages = await PageModel.findOne({ 
            where,
        });
        if(pages){
            res.send({ 'message':'Lấy dữ liệu trang bài viết thành công', 'data' : pages });
        }else{
            res.status(404).send({ 'message' : 'Trang bài viết này không tồn tại' });
        }
    }

    /**
     * Get all pages
     * @param {*} req 
     * @param {*} res 
     */
    static async getAllPages(req, res) {
        // Process
        let postCache = await CacheService.getCache('pages');
        postCache = postCache ? postCache : {};
        if (!postCache['pageAll']) {
            const where = { status: 'active' };
            const order = [
                ['createdAt', 'ASC']
            ];
            const attributes = ['title', 'slug'];
            postCache['pageAll'] = await PageModel.findAll({ where, order, attributes });
        }
        await CacheService.saveCache(postCache, 'pages');
        res.send({ 'message': 'Lấy danh sách danh mục thành công', 'data': postCache['pageAll'] });
    }
}
module.exports = PageController;