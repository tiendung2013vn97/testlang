const { sequelize, Sequelize } = require('sequelize');
const CommonService = require('../services/common.service');
const UserModel = require('../database/models/user.model');
const CacheService = require('../services/cache.service');
const AuthService = require('../services/auth.service');
const VideoModel = require('../database/models/video.model');
const CommentModel = require('../database/models/comment.model');
const Op = Sequelize.Op;

class CommentController {
    /**
     * send comment by id_video
     * @params req, res
     * @return {void}
     */
    static async sendComment(req, res) {
        const user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message': 'Thông tin đăng nhập không chính xác' })
        }
        const { idVideo, idComment } = req.query;
        const { content } = req.body;
        const video = await VideoModel.findOne({ 
            where: {
                id: idVideo, 
                status: 'active',
            },
        });
        if(!video){
            return res.status(404).send({ 'message':'Video này không tồn tại' });
        }
        const comment = await CommentModel.create({
            content,
            status: 'active',
            user_id: user.id,
            video_id: idVideo,
            parentId: idComment ? idComment : 0,
        });
        
        await video.update({
            comments: video.comments + 1,
        });
        return res.send({ 'message' : 'Bình luận video thành công', 'data': comment });
    }

    /**
     * send reply by id_video & id_comment
     * @params req, res
     * @return {void}
     */
    static async sendReply(req, res) {
        const user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message': 'Thông tin đăng nhập không chính xác' })
        }
        const { idVideo, idComment } = req.query;
        const { content } = req.body;
        const video = await VideoModel.findOne({ 
            where: { 
                id: idVideo, 
                status: 'active',
            },
        });
        if(!video){
            return res.status(404).send({ 'message':'Video này không tồn tại' });
        }
        const comment = await CommentModel.create({
            content,
            status: 'active',
            user_id: user.id,
            video_id: idVideo,
            parentId: idComment,
        });
        
        await video.update({
            comments: video.comments + 1,
        });
        return res.send({ 'message' : 'Bình luận video thành công', 'data': comment });
    }

    /**
     * Get list replies by parent_id
     * @params req, res
     * @return {void}
     */
    static async getListReplies(req, res) {
        const { parentId } = req.params;
        const where = { parentId, status: 'active' };
        const include = [{
            model: UserModel,
            attributes: ['username', 'avatar'],
        }]
        const order = [
            ['createdAt', 'ASC']
        ];
        const resource = { model: CommentModel, req, where, order, include };
        const replies = await CommonService.paginate(resource);
        res.send({ 'message' : 'Lấy câu trả lời thành công', 'data' : replies });
    }

    /**
     * Get comments by idvideo
     * @params req, res
     * @return {void}
     */
    static async getCommentsByIdVideo(req, res) {
        const { idVideo } = req.params;
        // Start get comments video
        const where = {
            status: 'active',
            parentId: '0',
            video_id: idVideo,
        };
        const order = [
            ['createdAt', 'DESC']
        ];
        const include = [
            {
                model: UserModel,
            }
        ];
        const resource = { model: CommentModel, req, where, order, include };
        let comments = await CommonService.paginate(resource);
        comments = JSON.parse(JSON.stringify(comments));

        for(let i in comments.data) {
            let comment = comments.data[i];
            comments.data[i].reply = await CommentModel.count({ where: { parentId: comment.id, status: 'active' } });
        }
        return res.send({ 'message':'Lấy dữ liệu comments thành công', comments });
    }
}
module.exports = CommentController;