const { sequelize, Sequelize } = require('sequelize');
const CommonService = require('../services/common.service');
const UserModel = require('../database/models/user.model');
const CacheService = require('../services/cache.service');
const AuthService = require('../services/auth.service');
const ChannelModel = require('../database/models/channel.model');
const VideoModel = require('../database/models/video.model');
const SubcribeChannel = require('../database/models/subcribe.model');
const VideoUserModel = require('../database/models/video-user.model');
const LangModel = require('../database/models/lang.model');
const Op = Sequelize.Op;

class channelController{
    /**
     * Get list resource with paginate
     * @param {*} req 
     * @param {*} res
     */
    static async getList(req, res){
        const { page, key_words } = req.query;
        if(key_words){
            const where = {
                [Op.or]: [
                    { title: {[Op.like]: '%' +  key_words + '%'} },
                    { subcribes: {[Op.like]: '%' +  key_words + '%'} },
                    { status: {[Op.like]: '%' +  key_words + '%'} },
                    { statusSub: {[Op.like]: '%' +  key_words + '%'} },
                    { '$user.username$': {[Op.like]: '%' +  key_words + '%'} },
                    { '$user.email$': {[Op.like]: '%' +  key_words + '%'} },
                ]
            };
            const order = [
                ['createdAt', 'DESC']
            ];
            const include = [
                {
                    model: UserModel,
                    attributes: ['username', 'avatar', 'email'],
                    required: false,
                },
            ];
            const resource = { model: ChannelModel, req, where, order, include };
            const channel = await CommonService.paginate(resource);
            return res.send({ 'message' : 'Lấy danh sách channel thành công', 'data' : channel });
        }else{
            let channelCache = await CacheService.getCache('channel');
            channelCache = channelCache ? channelCache : {};
            if (!channelCache[`channelPage-${page}`]) {
                const order = [
                    ['createdAt', 'DESC']
                ];
                const include = [
                    {
                        model: UserModel,
                        attributes: ['username', 'avatar', 'email'],
                        required: false,
                    },
                ];
                const resource = { model: ChannelModel, req, order, include };
                channelCache[`channelPage-${page}`] = await CommonService.paginate(resource);
            }
            await CacheService.saveCache(channelCache, 'channel');
            res.send({ 'message': 'Lấy danh sách channel thành công', 'data': channelCache[`channelPage-${page}`] });
        }
    }

    /**
     * Create new resource
     * @params req, res
     * @return {void}
     */
    static async create(req, res) {
        // Init
        const { title, statusSub, bannerStr, avatarStr, description } = req.body;

        // Process
        const user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message': 'Thông tin đăng nhập không chính xác' })
        }
        // if(user.account_type == "USER"){
        //     await user.update({
        //         account_type: 'PROVIDER',
        //     });
        // }
        const checkExistNot = await ChannelModel.findOne({ where: { user_id: user.id } });
        if(!checkExistNot){
            const banner = bannerStr ? await CommonService.uploadImage(bannerStr) : '';
            const avatar = avatarStr ? await CommonService.uploadImage(avatarStr) : '';
            const channel = await ChannelModel.create({
                title,
                banner,
                avatar,
                statusSub,
                description,
                user_id: user.id,
            });
            let slug = await CommonService.convertSlug(title);
            slug = `${slug}-${channel.id}`;
            await channel.update({
                slug,
            })
            await CacheService.removeCache('users');
            await CacheService.removeCache('channel');
            res.send({ 'message' : 'Tạo channel mới thành công', channel });
        }else{
            res.status(403).send({ 'message': 'Mỗi tài khoản chỉ được tạo 1 kênh channel' });
        }
    }

    /**
     * Update resource
     * @params req, res
     * @return {void}
     */
    static async update(req,res){
        const { id } = req.params;
        const { title, bannerStr, avatarStr, status, statusSub, description } = req.body;
        const user = await AuthService.user(req);

        let where = { id };
        if(!user || user.account_type != "ADMIN"){
            res.status(403).send({ 'message' : 'Tài khoản của bạn không có quyền thực hiện chức năng này!' });
        }else{
            const channel = await ChannelModel.findOne({ where });
            if(channel){
                let banner = bannerStr ? await CommonService.uploadImage(bannerStr) : channel.banner;
                let avatar = avatarStr ? await CommonService.uploadImage(avatarStr) : channel.avatar;
                let slug = await CommonService.convertSlug(title);
                slug = `${slug}-${channel.id}`;
                await channel.update({
                    title,
                    slug,
                    banner,
                    avatar,
                    status,
                    statusSub,
                    description,
                });
                await CacheService.removeCache('channel');
                await CacheService.removeCache('users');
                res.send({ 'message':'Cập nhật channel thành công' });
            }else{
                res.status(404).send({ 'message': 'Channel này không tồn tại' });
            }
        }
    }
    
    /**
     * Get data edit resource
     * @params req, res
     * @return {void}
     */
    static async edit(req,res){
        const user = await AuthService.user(req);
        const { id } = req.params;
        if(!user || user.account_type != "ADMIN"){
            return res.status(403).send({ 'message' : 'Tài khoản của bạn không có quyền thực hiện chức năng này!' });
        }
        const channel = await ChannelModel.findOne({ 
            where: {
                id,
            },
        });
        if(channel){
            return res.send({ 'message':'Lấy dữ liệu Channel thành công', 'data' : channel });
        }else{
            return res.status(404).send({ 'message':'Channel này không tồn tại' });
        }
    }

    /**
     * Get data channel resource
     * @params req, res
     * @return {void}
     */
    static async getDetailChannel(req,res){
        const user = await AuthService.user(req);
        let { slug } = req.params;
        slug =encodeURIComponent(slug)
        const { limitFeatured, limitPopular, lang, langTrans } = req.query;
        const channel = await ChannelModel.findOne({ 
            where: {
                slug,
                status: 'active',
            },
            include: [
                { 
                    model: UserModel,
                    attributes: ['avatar'],
                    where: {
                        status: 'active',
                    },
                },
                {
                    model: UserModel,
                    as: 'subcribers',
                    through: {
                        where: { status: 'sub' },
                    },
                    attributes: ['username'],
                    where: {
                        id: user ? user.id : 0,
                    },
                    required: false,
                }
            ],
        });
        if(channel){
            let checkWatchLater = '';
            //Start show videos channel
            const featuredVideos = await VideoModel.findAll({ 
                where: { 
                    user_id: channel.user_id, 
                    status: 'active',
                },
                order: [ [ 'createdAt', 'DESC' ] ],
                include: [
                    {
                        model: LangModel,
                        as: 'raw_lang',
                        where: lang!="any"? {
                            code: lang ? lang : "en",
                            status: "active",
                        }:{},
                        required: true,
                    },
                    {
                        model: LangModel,
                        as: 'translate_lang',
                        where:  langTrans!="any"? {
                            code: langTrans ? langTrans : "vi",
                            status: "active",
                        }:{},
                        required: true,
                    },
                    {
                        model: UserModel,
                        where: {
                            status: "active",
                        },
                        attributes: ['id', 'avatar'],
                        include: [{
                            model: ChannelModel,
                            where: {
                                status: "active",
                            },
                            attributes: ['slug', 'banner', 'avatar', 'title'],
                        }],
                        required: true,
                    },
                ],
                limit: limitFeatured ? parseInt(limitFeatured) : 10,
            });

            for(let i in featuredVideos){
                featuredVideos[i].dataValues.watchLater = 'no';
            }
            const popularVideos = await VideoModel.findAll({ 
                where: {
                    user_id: channel.user_id, 
                    status: 'active',
                },
                order: [ 
                    [ 'view', 'DESC' ],
                    [ 'likes', 'DESC' ],
                ],
                include: [
                    {
                        model: LangModel,
                        as: 'raw_lang',
                        where: lang!='any'?{
                            code: lang ? lang : "en",
                            status: "active",
                        }:{},
                        required: true,
                    },
                    {
                        model: LangModel,
                        as: 'translate_lang',
                        where: langTrans!='any'?{
                            code: langTrans ? langTrans : "vi",
                            status: "active",
                        }:{},
                        required: true,
                    },
                    {
                        model: UserModel,
                        where: {
                            status: "active",
                        },
                        attributes: ['id', 'avatar'],
                        include: [{
                            model: ChannelModel,
                            where: {
                                status: "active",
                            },
                            attributes: ['slug', 'banner', 'avatar', 'title'],
                        }],
                        required: true,
                    },
                ],
                limit: limitPopular ? parseInt(limitPopular) : 6,
            });
            for(let i in popularVideos){
                popularVideos[i].dataValues.watchLater = 'no';
            }

            //Start Check video have in watch_later or not - featuredVideos videos and popularVideos in channel page
            for(let i in featuredVideos){
                checkWatchLater = await VideoUserModel.findOne({
                    where: {
                        type: 'watch_later',
                        video_id: featuredVideos[i].id,
                        user_id: user ? user.id : 0,
                    },
                    required: true,
                });
                if(checkWatchLater){
                    featuredVideos[i].dataValues.watchLater = "yes";
                }else{
                    featuredVideos[i].dataValues.watchLater = "no";
                }
            }
            for(let i in popularVideos){
                checkWatchLater = await VideoUserModel.findOne({
                    where: {
                        type: 'watch_later',
                        video_id: popularVideos[i].id,
                        user_id: user ? user.id : 0,
                    },
                    required: true,
                });
                if(checkWatchLater){
                    popularVideos[i].dataValues.watchLater = "yes";
                }else{
                    popularVideos[i].dataValues.watchLater = "no";
                }
            }
            
            //Start get all video in channel
            let where = "";
            if(user && user.id == channel.user_id){
                where = {
                    user_id: channel.user_id,
                    [Op.or]: [
                        { status: "active" },
                        { status: "pending" },
                    ]
                };
            }else{
                where = {
                    user_id: channel.user_id,
                    status: 'active' 
                };
            }
            
            const order = [
                ['createdAt', 'DESC']
            ];
            const include = [
                {
                    model: LangModel,
                    as: 'raw_lang',
                    where: lang!='any'?{
                        code: lang ? lang : "en",
                        status: "active",
                    }:{},
                    required: true,
                },
                {
                    model: LangModel,
                    as: 'translate_lang',
                    where: langTrans!='any'?{
                        code: langTrans ? langTrans : "vi",
                        status: "active",
                    }:{},
                    required: true,
                },
                {
                    model: UserModel,
                    where: {
                        status: "active",
                    },
                    attributes: ['id', 'avatar'],
                    include: [{
                        model: ChannelModel,
                        where: {
                            status: "active",
                        },
                        attributes: ['slug', 'banner', 'avatar', 'title'],
                    }],
                    required: true,
                },
            ];
            const resource = { model: VideoModel, req, where, order, include };
            const listVideo = await CommonService.paginate(resource);
            for(let i in listVideo.data){
                listVideo.data[i].dataValues.watchLater = 'no';
            }
            
            //Start Check video have in watch_later or not - all videos tab videos in channel page
            for(let i in listVideo.data){
                checkWatchLater = await VideoUserModel.findOne({
                    where: {
                        type: 'watch_later',
                        video_id: listVideo.data[i].id,
                        user_id: user ? user.id : 0,
                    },
                    required: true,
                });
                if(checkWatchLater){
                    listVideo.data[i].dataValues.watchLater = "yes";
                }else{
                    listVideo.data[i].dataValues.watchLater = "no";
                }
            }
            res.send({ 'message':'Lấy dữ liệu Channel thành công', 'data' : listVideo, channel, featuredVideos, popularVideos });
        }else{
            res.status(404).send({ 'message':'Channel này không tồn tại' });
        }
    }

    /**
     * Get data channel user is loggining resource
     * @params req, res
     * @return {void}
     */
    static async getDetailChannelUser(req,res){
        const user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message': 'Thông tin đăng nhập không chính xác' })
        }
        let { slug } = req.params;
        // slug=encodeURIComponent(slug)
        const channel = await ChannelModel.findOne({ 
            where: {
                slug,
                status: 'active',
            },
            include: [
                { 
                    model: UserModel,
                    attributes: ['avatar'],
                    where: {
                        id: user.id,
                        status: 'active',
                    },
                    required: true,
                },
            ],
        });
        if(channel){
            res.send({ 'message':'Lấy dữ liệu Channel thành công', 'data' : channel });
        }else{
            res.status(404).send({ 'message':'Channel này không tồn tại' });
        }
    }

    /**
     * update channel user is loggining resource
     * @params req, res
     * @return {void}
     */
    static async updateChannelUser(req,res){
        const user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message': 'Thông tin đăng nhập không chính xác' })
        }
        let { slug } = req.params;
        // slug=encodeURIComponent(slug)
        const { title, bannerStr, avatarStr, statusSub, description } = req.body;
        const channel = await ChannelModel.findOne({ 
            where: {
                slug,
                status: 'active',
            },
            include: [
                { 
                    model: UserModel,
                    attributes: ['avatar'],
                    where: {
                        id: user.id,
                        status: 'active',
                    },
                },
            ],
        });
        if(channel){
            let banner = bannerStr ? await CommonService.uploadImage(bannerStr) : channel.banner;
            let avatar = avatarStr ? await CommonService.uploadImage(avatarStr) : channel.avatar;
            let slug = await CommonService.convertSlug(title);
            slug = `${slug}-${channel.id}`;
            await channel.update({
                title,
                slug,
                banner,
                avatar,
                statusSub,
                description,
            });
            res.send({ 'message':'Cập nhật channel thành công', channel });
        }else{
            res.status(404).send({ 'message':'Channel này không tồn tại' });
        }
    }

    /**
     * sub/unsub channel by id_channel
     * @params req, res
     * @return {void}
     */
    static async subChannel(req,res){
        const { id } = req.params;
        let status = '', notice = '';
        const user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message': 'Thông tin đăng nhập không chính xác' })
        }
        const channel = await ChannelModel.findOne({ 
            where: {
                id,
                status: 'active',
            },
        });
        if(!channel){
            return res.status(404).send({'message':'Channel này không tồn tại.'});
        }
        if(channel.user_id == user.id){
            return res.status(403).send({'message':'Bạn không thể tự đăng ký channel của mình.'});
        }

        let where = {
            channel_id: id,
            user_id: user.id,
        };
        let subChannel = await SubcribeChannel.findOne({ where });
        let subcribes = channel.subcribes;
        if(subChannel){
            status = subChannel.status;
            if(status == 'sub'){
                status = 'unsub';
                notice = 'hủy đăng ký';
                subcribes--;
            }else{
                status = 'sub';
                notice = 'đăng ký';
                subcribes++;
            }
            await subChannel.update({
                status,
            });
        }else{
            subChannel = await SubcribeChannel.create({
                channel_id: id,
                user_id: user.id,
            });
            subcribes++;
            notice = 'đăng ký';
        }
        await channel.update({
            subcribes,
        });
        res.send({'message': 'Bạn đã '+ notice +' kênh này thành công', 'data': subChannel});
    }

    /**
     * Get list channel user sub by user_id
     * Get channels user is logging subcribe 
     * @params req, res
     * @return {void}
     */
    static async getListChannelSub(req, res){
        const user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message': 'Thông tin đăng nhập không chính xác' })
        }
        const channelSub = await SubcribeChannel.findAll({
            where: {
                user_id: user.id,
                status: 'sub',
            },
            required: true,
            order: [
                ['createdAt', 'DESC']
            ],
        });
        let channel = [];
        if(channelSub.length > 0){
            for(let i in channelSub){
                let getChannel = await ChannelModel.findOne({
                    where: {
                        id: channelSub[i].channel_id,
                        status: 'active',
                    },
                    include: {
                        model: UserModel,
                        where: {
                            status: 'active',
                        },
                        attributes: ['id', 'username', 'email', 'phone', 'status', 'balance', 'account_type'],
                        include: {
                            model: VideoModel,
                            where: {
                                status: 'active',
                            }
                        }
                    },
                    required: true,
                });

                if(getChannel){
                    channel.push(getChannel);
                }
            }
        }
        res.send({ 'message': 'Lấy thành công danh sách channel user đăng ký', channel });
    }

    /**
     * Check Channel Exist by user is loggining to make create channel or setting channel
     * @params req, res
     * @return {void}
     */
    static async checkExist(req,res){
        const user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message': 'Thông tin đăng nhập không chính xác' })
        }
        const channel = await ChannelModel.findOne({ 
            where: {
                user_id: user.id ? user.id : 0,
                status: 'active'
            },
        });
        return res.send({ 'message':'Lấy dữ liệu Channel thành công', 'data' : channel });
    }
}
module.exports = channelController;