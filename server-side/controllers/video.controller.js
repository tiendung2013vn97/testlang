const VideoModel = require('../database/models/video.model');
const UserModel = require('../database/models/user.model');
const SubcribeChannel = require('../database/models/subcribe.model');
const SubTitleModel = require('../database/models/subtitle.model');
const CategoryVideoModel = require('../database/models/category-video.model');
const CategoryModel = require('../database/models/category.model');
const ChannelModel = require('../database/models/channel.model');
const VideoUserModel = require('../database/models/video-user.model');
const LangModel = require('../database/models/lang.model');
const HistoryModel = require('../database/models/history.model');
const TranslateModel = require('../database/models/translate.model');
const ViewModel = require('../database/models/view.model');
const VideoPaymentModel = require('../database/models/video-payment.model');
const ActiveTokenModel = require('../database/models/active-token.model');
const SettingController = require('../controllers/setting.controller');
const CommonService = require('../services/common.service');
const JWTService = require('../services/jwt.service');
const CacheService = require('../services/cache.service');
const AuthService = require('../services/auth.service');
const { sequelize, Sequelize } = require('sequelize');
const requestIp = require("request-ip");
const moment = require('moment');
require('sequelize-hierarchy')(Sequelize);
const _ = require('lodash');
const Op = Sequelize.Op;
const fs=require("fs")
const path=require("path")
const logger=require("../modules/logger");
const CommentModel = require('../database/models/comment.model');

class VideoController {

    /**
     * Get list resource with paginate
     * @param {*} req 
     * @param {*} res 
     */
    static async getList(req, res) {
        const { page, key_words } = req.query;
        const user = await AuthService.user(req);
        if(!user || user.account_type != 'ADMIN' && user.account_type != 'PROVIDER'){
            res.status(403).send({ 'message':'Bạn không có quyền thực hiện chức năng này!' });
        }else{
            if(key_words){
                const where = { 
                    status: { [Op.not]: 'deleted' },
                    [Op.or]: [
                        { title: {[Op.like]: '%' +  key_words + '%'} },
                        { status: {[Op.like]: '%' +  key_words + '%'} },
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
                        where: {
                            status: 'active'
                        },
                        attributes: ['username', 'avatar'],
                    },
                    {
                        model: CategoryModel,
                        where: { status: 'active' },
                        attributes: ['title','icon'],
                    },
                ];
                const resource = { model: VideoModel, req, where, order, include };
                const videos = await CommonService.paginate(resource);
                return res.send({ 'message' : 'Lấy danh sách video thành công', 'data' : videos });
            }else{
                let videoCache = {};
                let where = {
                    status: { [Op.not]: 'deleted' },
                };
                if(user.account_type === 'PROVIDER'){
                    where.user_id = user.id;
                }
                const order = [
                    ['createdAt', 'DESC']
                ];
                const include = [
                    {
                        model: UserModel,
                        where: { status: 'active' },
                        attributes: ['username', 'avatar'],
                    },
                    {
                        model: CategoryModel,
                        where: { status: 'active' },
                        attributes: ['title','icon'],
                    },
                ];
                const resource = { model: VideoModel, req, where, order, include };
                videoCache[`videoPage-${page}`] = await CommonService.paginate(resource);
                res.send({ 'message': 'Lấy danh sách video thành công', 'data': videoCache[`videoPage-${page}`] });
            }
        }
    }

    /**
     * get detail video
     * up to view video
     * @params req, res
     * @return {void}
     */
    static async getDetailVideo(req, res) {
        let { slug } = req.params;
        const user = await AuthService.user(req);
        //  console.log(slug)
        // slug=encodeURIComponent(slug)
        // console.log(slug)
        // Start  get detail video by slug
        const videoDetail = await VideoModel.findOne({
            where: {
                slug,
                status: 'active',
            },
            include: [
                {
                    model: UserModel,
                    where: { status: 'active' },
                    required: true,
                    attributes: ['username'],
                    include: [
                        {
                            model: ChannelModel,
                            where: { status: 'active' },
                            required: true,
                        },
                    ],
                },
                { 
                    model: CategoryModel,
                    where: {
                        status: 'active',
                    },
                    required: false,
                },
                {
                    model: LangModel,
                    as: 'raw_lang',
                    where: {
                        status: 'active',
                    },
                },
                {
                    model: LangModel,
                    as: 'translate_lang',
                    where: {
                        status: 'active',
                    },
                }
            ],
        });
        if(!videoDetail){
            return res.status(404).send({ 'message':'Video này không tồn tại.' });
        }else{
            let idVideo = videoDetail.id;

            // Start get information Channel from video detail
            const channel = await ChannelModel.findOne({ 
                where: {
                    id: videoDetail.user.channel.id,
                },
                include: [
                    { 
                        model: UserModel,
                        attributes: ['username', 'avatar'],
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
                        attributes: ['username', 'avatar'],
                        where: {
                            id: user ? user.id : 0,
                        },
                        required: false,
                    }
                ],
            });

            // Start check ip and id_video => add view
            const ip = requestIp.getClientIp(req);
            const checkRule = await ViewModel.findOne({
                where: {
                    ip_address: ip,
                    video_id: idVideo,
                },
                required: true,
            });
            if(!checkRule){
                await ViewModel.create({
                    ip_address: ip,
                    video_id: idVideo,
                });
                videoDetail.update({
                    view: videoDetail.view + 1,
                });
            }else{
                let fromDate = moment().subtract(3, 'h').toISOString();
                let timeData = checkRule.updatedAt.toISOString();
                if(fromDate > timeData){ //samme as ip and id_video => after 3 minutes => +1 view
                    checkRule.update({
                        count: checkRule.count + 1,
                    });
                    videoDetail.update({
                        view: videoDetail.view + 1,
                    });
                }
            }

            // Start get status like, dislike, watch_later video user is loginning
            let videoFeel = await VideoUserModel.findOne({
                where: {
                    type: { [Op.not]: 'watch_later' },
                    video_id: idVideo,
                    user_id: user.id ? user.id : 0,
                },
            });
            let videoLater = await VideoUserModel.findOne({
                where: {
                    type: 'watch_later',
                    video_id: idVideo,
                    user_id: user.id ? user.id : 0,
                },
            });

            // Start get sub video
            let whereSubtitle = {
                video_id: idVideo,
            };
            let limitSubtitle = "";
            let userPayment = '';
            if(videoDetail.price > 0){
                if(!user || user && videoDetail.user_id != user.id) { 
                    //if not login, login and video not upload by user is logginning and if video have fee, show 30subs first
                    const videoPayment = await VideoPaymentModel.findOne({
                        where: {
                            video_id: idVideo,
                            user_buy: user ? user.id : 0,
                        },
                    });
                    if(!videoPayment){
                        userPayment = 'no';
                        limitSubtitle = 20;
                    }else{
                        userPayment = 'yes';
                    }
                }
            }
            let subTitles = "";
            if(limitSubtitle){
                subTitles = await SubTitleModel.findAll({
                    where: whereSubtitle,
                    order: [
                        ['createdAt', 'ASC']
                    ],
                    limit: limitSubtitle,
                    required: true,
                });
            }else{
                subTitles = await SubTitleModel.findAll({
                    where: whereSubtitle,
                    order: [
                        ['createdAt', 'ASC']
                    ],
                    required: true,
                });
            }
            return res.send({ 'message':'Lấy dữ liệu video thành công', 'data': videoDetail, channel, videoFeel, videoLater, subTitles, userPayment });
        }
    }

    /**
     * Search video
     * @params req, res
     * @return {void}
     */
    static async searchVideo(req, res) {
        const { key_words, category, order_by, lang, langTrans } = req.query;
        if(key_words || category || order_by || lang) {
            let where = { status: 'active' };
            if(key_words) {
                where.title = { [Op.like]: '%' + key_words + '%' };
            }
            let order = '';
            if(order_by == 'like'){
                order = [
                    ['likes', 'DESC'],
                    ['view', 'DESC'],
                    ['createdAt', 'DESC']
                ];
            }else if(order_by == 'view'){
                order = [
                    ['view', 'DESC'],
                    ['likes', 'DESC'],
                    ['createdAt', 'DESC']
                ];
            }else{
                order = [
                    ['createdAt', 'DESC'],
                    ['view', 'DESC'],
                    ['likes', 'DESC'],
                ];
            }
            let include = [
                {
                    model: UserModel,
                    where: { status: 'active' },
                    attributes: ['username', 'avatar'],
                    include: [{
                        model: ChannelModel,
                        where: { status: 'active' },
                        required: true,
                    }],
                    required: true,
                },
                {
                    model: LangModel,
                    as: 'raw_lang',
                    where: {
                        code: lang ? lang : "en",
                        status: "active",
                    },
                    required: true,
                },
                {
                    model: LangModel,
                    as: 'translate_lang',
                    where: {
                        code: langTrans ? langTrans : "vi",
                        status: "active",
                    },
                    required: true,
                },
            ];
            if(category) {
                include.push({
                    model: CategoryModel,
                    where: { id: category, status: 'active' },
                    required: true,
                });
            }
            const resource = { model: VideoModel, req, where, order, include };
            const data = await CommonService.paginate(resource);
            return res.send({ 'message': 'Lấy dữ liệu video thành công', 'data': data });
        }else {
            return res.status(404).send({ 'message': 'Không tìm thấy kết quả nào' });
        }
    }

    /**
     * Create new resource
     * @params req, res
     * @return {void}
     */
    static async create(req, res) {
        // Init
        let { title, description, imageStr, linkImage, link, categories, subtitles, price, lang, langTranslate, duration,type } = req.body;
        // Process
        const user = await AuthService.user(req);
        // if(!user || user.account_type != "PROVIDER" && user.account_type != "ADMIN"){
        //     return res.status(403).send({ 'message' : 'Tài khoản của bạn không có quyền thực hiện chức năng này!' });
        // }
        const findVideo = await VideoModel.findOne({
            where: {
                link,
                status: "active",
                lang_translate: langTranslate.id ? langTranslate.id : '',
            }
        });
        if(findVideo){
            return res.status(403).send({ 'message' : 'Video này đã có người dịch!' });
        }
        const image = imageStr ? await CommonService.uploadImage(imageStr) : linkImage;

        // if(type=="file") link=await CommonService.uploadVideo(file)
        const video = await VideoModel.create({
            title,
            description,
            image,
            link,
            user_id: user.id,
            lang_id: lang.id ? lang.id : '',
            lang_translate: langTranslate.id ? langTranslate.id : '',
            duration,
            price: price ? price : 0,
            status: user.account_type == "ADMIN" ? 'active' : 'pending',
            type
        });  
        let slug = await CommonService.convertSlug(title);
        
        slug = `${slug}-${video.id}`;
        await video.update({
            slug,
        })
        let raw_mean = '';
        for(let i in subtitles){
            //create sub video
            raw_mean = JSON.stringify({ default: subtitles[i].raw_mean.default, trans: subtitles[i].raw_mean.trans });
            await SubTitleModel.create({
                start: Number.parseFloat(subtitles[i].start).toFixed(3),
                end: Number.parseFloat(subtitles[i].end).toFixed(3),
                full_mean: subtitles[i].full_mean,
                default_mean: subtitles[i].default_mean,
                raw_mean: raw_mean ? raw_mean : '',
                pronunciation: JSON.stringify(subtitles[i].pronunciation),
                video_id: video.id,
                exact_mean:subtitles[i].exact_mean,
            });

            //add exact_mean into translate table
            if(subtitles[i].exact_mean!=""&&subtitles[i].default_mean!="" && (user.account_type=="PROVIDER"||user.account_type=="ADMIN")){
                let exactTrans= await TranslateModel.findOne({
                    where:{
                        words:subtitles[i].default_mean,
                        translate:subtitles[i].exact_mean,
                        type:"full_line",
                        lang_id: lang.id ? lang.id : '',
                        lang_translate: langTranslate.id ? langTranslate.id : '',
                    }
                })

                if(exactTrans){
                    await exactTrans.update({count:exactTrans.count+1})
                }else{
                    await TranslateModel.create({
                            words:subtitles[i].default_mean,
                            translate:subtitles[i].exact_mean,
                            type:"full_line",
                            count:1,
                            lang_id: lang.id ? lang.id : '',
                            lang_translate: langTranslate.id ? langTranslate.id : '',
                            status: 'active',
                        })
                }
            }
            
            if(user.account_type=="PROVIDER"||user.account_type=="ADMIN"){
              // add pronoun and trans by word from user
              raw_mean = JSON.parse(raw_mean);
              for(let j in raw_mean.default){
                  if(raw_mean.default[j] != '' && raw_mean.default[j] != null && subtitles[i].pronunciation[j] != null){
                      // //add pronoun
                      // let findPronoun =  await TranslateModel.findOne({
                      //     where: {
                      //         words: raw_mean.default[j],
                      //         translate: subtitles[i].pronunciation[j],
                      //         type: 'pronoun',
                      //         lang_id: lang.id ? lang.id : '',
                      //         lang_translate: langTranslate.id ? langTranslate.id : '',
                      //         status: 'active',
                      //     },
                      // });
                      // if(!findPronoun){
                      //     await TranslateModel.create({
                      //         words: raw_mean.default[j],
                      //         translate: subtitles[i].pronunciation[j],
                      //         type: 'pronoun',
                      //         lang_id: lang.id ? lang.id : '',
                      //         lang_translate: langTranslate.id ? langTranslate.id : '',
                      //         status: 'active',
                      //     });
                      // }else{
                      //     let count = findPronoun.count + 1;
                      //     await findPronoun.update({
                      //         count,
                      //     });
                      // }
                      //add trans by word
                      let findTransByWord =  await TranslateModel.findOne({
                          where: {
                              words: raw_mean.default[j],
                              translate: raw_mean.trans[j],
                              pronunciation:subtitles[i].pronunciation[j],
                              type: 'word',
                              lang_id: lang.id ? lang.id : '',
                              lang_translate: langTranslate.id ? langTranslate.id : '',
                              status: 'active',
                          },
                      });
                      if(!findTransByWord){
                          await TranslateModel.create({
                              words: raw_mean.default[j],
                              translate: raw_mean.trans[j],
                              pronunciation:subtitles[i].pronunciation[j],
                              type: 'word',
                              lang_id: lang.id ? lang.id : '',
                              lang_translate: langTranslate.id ? langTranslate.id : '',
                              status: 'active',
                          });
                      }else{
                          let count = findTransByWord.count + 1;
                          await findTransByWord.update({
                              count,
                          });
                      }
                  }
              }
            }
            //add full mean from user
            // if(subtitles[i].full_mean != '' && subtitles[i].full_mean != null && subtitles[i].default_mean != '' && subtitles[i].default_mean != null){
            //     let findFullWords =  await TranslateModel.findOne({
            //         where: {
            //             words: subtitles[i].default_mean,
            //             translate: subtitles[i].full_mean,
            //             type: 'full_line',
            //             lang_id: lang.id ? lang.id : '',
            //             lang_translate: langTranslate.id ? langTranslate.id : '',
            //             status: 'active',
            //         },
            //     });
            //     if(!findFullWords){
            //         await TranslateModel.create({
            //             words: subtitles[i].default_mean,
            //             translate: subtitles[i].full_mean,
            //             type: 'full_line',
            //             lang_id: lang.id ? lang.id : '',
            //             lang_translate: langTranslate.id ? langTranslate.id : '',
            //             status: 'active',
            //         });
            //     }else{
            //         let count = findFullWords.count + 1;
            //         await findFullWords.update({
            //             count,
            //         });
            //     }
            // }
        }
        
        for(let i in categories){
            let category = categories[i];
            if(category.id) {
                await CategoryVideoModel.create({
                    video_id: video.id,
                    category_id: category.id,
                }) 
            }
        }
        await CacheService.removeCache('videos');
        await CacheService.removeCache('categories');
        await CacheService.removeCache('list-pronouns');
        await CacheService.removeCache('list-full-line');
        await CacheService.removeCache('list-words');
        res.send({ 'message' : 'Tạo video mới thành công', 'data' : video });
    }

    /**
     * Update resource
     * @params req, res
     * @return {void}
     */
    static async update(req, res) {
        const { id } = req.params;
        const { title, description, imageStr, link, categories, status, subtitles, price, lang, langTranslate } = req.body;
        const user = await AuthService.user(req);
        let where = { id, status: { [Op.not]: 'deleted' } };
      
        const findVideo = await VideoModel.findOne({
            where: {
                link,
                id: { [Op.not]: id },
                status: "active",
                lang_translate: langTranslate.id ? langTranslate.id : '',
            }
        });
        if(findVideo){
            return res.status(403).send({ 'message' : 'Video này đã có người dịch!' });
        }
        if(user.account_type !== "ADMIN"){
            where.user_id = user.id;
        }
        const video = await VideoModel.findOne({ where });
        if(video){
            let image = imageStr ? await CommonService.uploadImage(imageStr) : video.image;
            // let slug = await CommonService.convertSlug(title);
            let slug = title;
            slug = `${slug}-${video.id}`;
            await video.update({
                title,
                description,
                image,
                link,
                slug,
                lang_id: lang.id,
                lang_translate: langTranslate.id,
                price: price ? price : 0,
                status: user.account_type == "ADMIN" && status ? status : video.status,
            });
            await CategoryVideoModel.destroy({ where: { video_id: id } });
            await SubTitleModel.destroy({ where: { video_id: id } });
            for(let i in categories){
                let category = categories[i];
                if(category.id) {
                    await CategoryVideoModel.create({
                        video_id: video.id,
                        category_id: category.id,
                    })
                }
            }

            let raw_mean = '';
            for(let i in subtitles){
                //create sub video
                raw_mean = JSON.stringify({ default: subtitles[i].raw_mean.default, trans: subtitles[i].raw_mean.trans });
                await SubTitleModel.create({
                    start: Number.parseFloat(subtitles[i].start).toFixed(3),
                    end: Number.parseFloat(subtitles[i].end).toFixed(3),
                    full_mean: subtitles[i].full_mean,
                    default_mean: subtitles[i].default_mean,
                    raw_mean: raw_mean ? raw_mean : '',
                    pronunciation: JSON.stringify(subtitles[i].pronunciation),
                    video_id: video.id,
                    exact_mean:subtitles[i].exact_mean,
                });

                if(user.account_type=="PROVIDER"||user.account_type=="ADMIN"){
                  //add exact_mean into translate table
                  if(subtitles[i].exact_mean!=""&&subtitles[i].default_mean!=""){
                      let exactTrans= await TranslateModel.findOne({
                          where:{
                              words:subtitles[i].default_mean,
                              translate:subtitles[i].exact_mean,
                              type:"full_line",
                              lang_id: lang.id ? lang.id : '',
                              lang_translate: langTranslate.id ? langTranslate.id : '',
                          }
                      })

                      if(exactTrans){
                          await exactTrans.update({count:exactTrans.count+1})
                      }else{
                          await TranslateModel.create({
                                  words:subtitles[i].default_mean,
                                  translate:subtitles[i].exact_mean,
                                  type:"full_line",
                                  count:1,
                                  lang_id: lang.id ? lang.id : '',
                                  lang_translate: langTranslate.id ? langTranslate.id : '',
                                  status: 'active',
                              })
                      }
                  }


                  // add pronoun and trans by word from user
                  raw_mean = JSON.parse(raw_mean);
                  for(let j in raw_mean.default){
                      if(raw_mean.default[j] != '' && raw_mean.default[j] != null && subtitles[i].pronunciation[j] != null){
                          // //add pronoun
                          // let findPronoun =  await TranslateModel.findOne({
                          //     where: {
                          //         words: raw_mean.default[j],
                          //         translate: subtitles[i].pronunciation[j],
                          //         type: 'pronoun',
                          //         lang_id: lang.id ? lang.id : '',
                          //         lang_translate: langTranslate.id ? langTranslate.id : '',
                          //         status: 'active',
                          //     },
                          // });
                          // if(!findPronoun){
                          //     await TranslateModel.create({
                          //         words: raw_mean.default[j],
                          //         translate: subtitles[i].pronunciation[j],
                          //         type: 'pronoun',
                          //         lang_id: lang.id ? lang.id : '',
                          //         lang_translate: langTranslate.id ? langTranslate.id : '',
                          //         status: 'active',
                          //     });
                          // }else{
                          //     let count = findPronoun.count + 1;
                          //     await findPronoun.update({
                          //         count,
                          //     });
                          // }
                          //add trans by word
                          let findTransByWord =  await TranslateModel.findOne({
                              where: {
                                  words: raw_mean.default[j],
                                  translate: raw_mean.trans[j],
                                  type: 'word',
                                  lang_id: lang.id ? lang.id : '',
                                  pronunciation:subtitles[i].pronunciation[j],
                                  lang_translate: langTranslate.id ? langTranslate.id : '',
                                  status: 'active'
                              },
                          });
                          if(!findTransByWord){
                              await TranslateModel.create({
                                  words: raw_mean.default[j],
                                  translate: raw_mean.trans[j],
                                  pronunciation:subtitles[i].pronunciation[j],
                                  type: 'word',
                                  lang_id: lang.id ? lang.id : '',
                                  lang_translate: langTranslate.id ? langTranslate.id : '',
                                  status: 'active',
                              });
                          }else{
                              let count = findTransByWord.count + 1;
                              await findTransByWord.update({
                                  count,
                              });
                          }
                      }
                  }
                }
                //add full mean from user
                // if(subtitles[i].full_mean != '' && subtitles[i].full_mean != null && subtitles[i].default_mean != '' && subtitles[i].default_mean != null){
                //     let findFullWords =  await TranslateModel.findOne({
                //         where: {
                //             words: subtitles[i].default_mean,
                //             translate: subtitles[i].full_mean,
                //             type: 'full_line',
                //             lang_id: lang.id ? lang.id : '',
                //             lang_translate: langTranslate.id ? langTranslate.id : '',
                //             status: 'active',
                //         },
                //     });
                //     if(!findFullWords){
                //         await TranslateModel.create({
                //             words: subtitles[i].default_mean,
                //             translate: subtitles[i].full_mean,
                //             type: 'full_line',
                //             lang_id: lang.id ? lang.id : '',
                //             lang_translate: langTranslate.id ? langTranslate.id : '',
                //             status: 'active',
                //         });
                //     }else{
                //         let count = findFullWords.count + 1;
                //         await findFullWords.update({
                //             count,
                //         });
                //     }
                // }
            }
            await CacheService.removeCache('videos');
            await CacheService.removeCache('categories');
            await CacheService.removeCache('list-pronouns');
            await CacheService.removeCache('list-full-line');
            await CacheService.removeCache('list-words');
            res.send({ 'message':'Cập nhật video thành công', 'data' : video });
        }else{
            res.status(404).send({ 'message': 'Video này không tồn tại' });
        }
        
    }
    
    /**
     * Delete resource
     * @params req, res
     * @return {void}
     */
    static async delete(req, res) {
        const { id } = req.params;
        const user = await AuthService.user(req);
        let where = { id, status: { [Op.not]:'deleted' } };

        if(user.account_type!="ADMIN"){
            where.user_id=user.id;
        }
        const video = await VideoModel.findOne({ where });
        if(!video) return res.status(404).send({ 'message':'Video này không tồn tại' });
        
        await CategoryVideoModel.destroy({
            where:{
                video_id:id
            }
        })
        await ViewModel.destroy({
            where:{
                video_id:id
            }
        })
        await SubTitleModel.destroy({
            where:{
                video_id:id
            }
        })

        await HistoryModel.destroy({
          where:{
              video_id:id
          }
        })

        await CommentModel.destroy({
          where:{
              video_id:id
          }
        })

        await VideoPaymentModel.destroy({
          where:{
              video_id:id
          }
        })

        await VideoUserModel.destroy({
          where:{
              video_id:id
          }
        })

        
          // await video.update({
          //     status: 'deleted',
          // });
          if(video.type=="file"){
            //delete video
            let temp = video.link.split(path.sep);
            temp.shift();
            let link = temp.join(path.sep);
            link =path.join(global.BASE_DIR,"assets",link)

            fs.unlink(link, (err) => {
                if (err) logger.error(`Error when delete file video ${link} !`,err);
                logger.info(`Delete file video ${link} successfully!`)
            });

            //delete image
            let temp2 = video.image.split(path.sep);
            temp2.shift();
            let link2 = temp2.join(path.sep);
            link2 =path.join(global.BASE_DIR,"assets",link2)

            fs.unlink(link2, (err) => {
                if (err) logger.error(`Error when delete file image ${link} !`,err);
                logger.info(`Delete file image ${link} successfully!`)
            });
          }

          await video.destroy()

          await CacheService.removeCache('videos');
          await CacheService.removeCache('categories');
          res.send({ 'message':'Xóa video thành công', 'data' : video });
        
    }

    /**
     * Get data edit resource
     * @params req, res
     * @return {void}
     */
    static async edit(req, res) {
        const { id } = req.params;
        const user = await AuthService.user(req);
        const where = {
          id,
          status: { [Op.not]: "deleted" },
        };
        if( user.account_type != "ADMIN") where.user_id=user.id
          const video = await VideoModel.findOne({ 
              where,
              include: [
                  {
                      model: CategoryModel,
                      where: { status: 'active' },
                      required: false,
                  },
                  {
                      model: SubTitleModel,
                      as: 'subVideo',
                      required: false,
                  },
                  {
                      model: LangModel,
                      as: 'raw_lang',
                      where: { status: 'active' },
                      required: false,
                  },
                  {
                      model: LangModel,
                      as: 'translate_lang',
                      where: { status: 'active' },
                      required: false,
                  }
              ]
          });
          if(video){
              res.send({ 'message':'Lấy dữ liệu video thành công', 'data' : video });
          }else{
              res.status(404).send({ 'message':'Video này không tồn tại' });
          }
        
    }

    /**
     * Update video in client
     * @params req, res
     * @return {void}
     */
    static async videoUpdate(req, res) {
        let { slug } = req.params;
        // slug=encodeURIComponent(slug)
        const user = await AuthService.user(req);

        const video = await VideoModel.findOne({ 
            where:{
                slug,
                status: { [Op.not]:'deleted' },
                user_id: user.id,
            },
            include: [
                {
                    model: CategoryModel,
                    where: { status: 'active' },
                    required: false,
                },
                {
                    model: SubTitleModel,
                    as: 'subVideo',
                    required: false,
                },
                {
                    model: LangModel,
                    as: 'raw_lang',
                    where: { status: 'active' },
                    required: false,
                },
                {
                    model: LangModel,
                    as: 'translate_lang',
                    where: { status: 'active' },
                    required: false,
                },
            ]
        });
        if(video){
            res.send({ 'message':'Lấy dữ liệu video thành công', 'data' : video });
        }else{
            res.status(404).send({ 'message':'Video này không tồn tại' });
        }
    }

    /**
     * Get list video offer, video suggestions and video news in home page
     * @params req, res
     * @return {void}
     */
    static async getListVideoRecommend(req, res) {
        // User login and have sub channel
        //    + video recommend: random videos order by view, likes from channel sub
        //    + video suggestions: get videos from channel sub
        //    + video latest: video latest order by createdAt from channel sub
        // User not login || user login without sub any channel
        //    + video recommend: random all videos by view, likes
        //    + video latest: all latest videos order by createdAt
        let { recommendLimit, latestLimit, suggestionsLimit, idVideo, lang, langTrans } = req.query;
        const user = await AuthService.user(req);
        let limitVideos = 0, limitRandomVideos = 0;
        let recommend = [], latest = [], suggestions = [];
        recommendLimit = recommendLimit ? parseInt(recommendLimit) : 12;
        latestLimit = latestLimit ? parseInt(latestLimit) : 12;
        suggestionsLimit = suggestionsLimit ? parseInt(suggestionsLimit) : 12;
        let channelSubs = '', channelSubSuggestions, channel = [];

        if(user){
            //check user sub channel
            channelSubs = await SubcribeChannel.findAll({
                where: {
                    user_id: user.id,
                    status: 'sub',
                },
                order: [ [Sequelize.fn( 'RAND')] ],
                limit: recommendLimit,
            });

            //Start get data 10 information channel sub to make video suggestions in home page
            channelSubSuggestions = await SubcribeChannel.findAll({
                where: {
                    user_id: user.id,
                    status: 'sub',
                },
                order: [ [Sequelize.fn( 'RAND')] ],
                limit: 10,
            });

            if(channelSubSuggestions.length > 0){
                for(let i in channelSubSuggestions){
                    let getChannel = await ChannelModel.findOne({
                        where: {
                            id: channelSubSuggestions[i].channel_id,
                            status: 'active',
                        },
                        include: {
                            model: UserModel,
                            attributes: ['username', 'avatar'],
                            where: {
                                status: 'active',
                            }
                        },
                        required: true,
                    });

                    if(getChannel){
                        channel.push(getChannel);
                    }
                }
            }

            //if user have sub channel => show videos from channel user sub
            if(channelSubs.length){
                // if user sub only 1 channel => make count user sub channel = 2 to:
                //      + show half video from channel sub && show half video random
                if(channelSubs.length == 1 && recommendLimit > 1) {
                    channelSubs.length = 2;
                }

                //quantity videos every channel user sub
                if(recommendLimit % channelSubs.length == 0){
                    limitVideos = recommendLimit / channelSubs.length;
                }else{
                    limitVideos = recommendLimit % channelSubs.length;
                    limitVideos = (recommendLimit - limitVideos) / channelSubs.length;
                }

                //Start recommend videos
                let recommend_id = [];
                let whereVideo = {
                    status: 'active',
                }
                if(idVideo){
                    recommend_id.push(idVideo);
                    whereVideo.id = { [Op.notIn]: [idVideo] };
                }
                for(let i in channelSubs) {
                    let channel = channelSubs[i];
                    let videos = await VideoModel.findAll({
                        where: whereVideo,
                        order: [
                            [Sequelize.fn( 'RAND')],
                        ],
                        include: [
                            {
                                model: UserModel,
                                where: { status: 'active' },
                                attributes: ['username', 'avatar'],
                                required: true,
                                include: [{
                                    model: ChannelModel,
                                    where: { 
                                        status: 'active',
                                        id: channel.channel_id,
                                    },
                                    required: true,
                                }],
                            },
                            {
                                model: LangModel,
                                as: 'raw_lang',
                                where:lang=="any"?{ status: "active"}: {
                                    code: lang,
                                    status: "active",
                                },
                                required: true,
                            },
                            {
                                model: LangModel,
                                as: 'translate_lang',
                                where: langTrans=="any"?{status:"active"}:{
                                    code: langTrans,
                                    status: "active",
                                },
                                required: true,
                            },
                        ],
                        limit: limitVideos,
                    });
                    for(let i in videos) {
                        videos[i].dataValues.watchLater = 'no';
                        recommend.push(videos[i]);
                        recommend_id.push(videos[i].id);
                    }
                }

                let videoRecommendRandom = [];
                limitRandomVideos = recommendLimit - recommend.length;
                if(limitRandomVideos > 0){
                    videoRecommendRandom = await VideoModel.findAll({
                        where: {
                            id: { [Op.notIn]: recommend_id },
                            status: 'active',
                        },
                        order: [
                            [Sequelize.fn( 'RAND')],
                        ],
                        include: [
                            {
                                model: UserModel,
                                where: { 
                                    status: 'active',
                                },
                                attributes: ['username', 'avatar'], 
                                required: true,
                                include: [{
                                    model: ChannelModel,
                                    where: { 
                                        status: 'active',
                                    },
                                    required: true,
                                }],
                            },
                            {
                                model: LangModel,
                                as: 'raw_lang',
                                where: {
                                    code: lang=="any"?{ status: "active"}:lang,
                                    status: "active",
                                },
                                required: true,
                            },
                            {
                                model: LangModel,
                                as: 'translate_lang',
                                where: langTrans=="any"?{status:"active"}:{
                                    code: langTrans,
                                    status: "active",
                                },
                                required: true,
                            }
                        ],
                        limit: limitRandomVideos,
                    });
                    for(let i in videoRecommendRandom) {
                        videoRecommendRandom[i].dataValues.watchLater = 'no';
                    }
                }
                let recommendMerge = [...recommend, ...videoRecommendRandom];
                recommend = _.orderBy(recommendMerge, ['view','likes'], ['desc','desc']);
                //Start Check video have in watch_later or not
                let checkWatchLater = '';
                
                for(let i in recommend){
                    checkWatchLater = await VideoUserModel.findOne({
                        where: {
                            type: 'watch_later',
                            video_id: recommend[i].id,
                            user_id: user.id,
                        },
                        required: true,
                    });
                    if(checkWatchLater){
                        recommend[i].dataValues.watchLater = "yes";
                    }else{
                        recommend[i].dataValues.watchLater = "no";
                    }
                }

                //Start suggestions videos
                for(let i in channelSubSuggestions) {
                    let channel = channelSubSuggestions[i];
                    let videos = await VideoModel.findAll({
                        where: {
                            status: 'active',
                        },
                        order: [
                            [Sequelize.fn( 'RAND')],
                        ],
                        include: [
                            {
                                model: UserModel,
                                where: { status: 'active' },
                                attributes: ['username', 'avatar'],
                                required: true,
                                include: [{
                                    model: ChannelModel,
                                    where: { 
                                        status: 'active',
                                        id: channel.channel_id,
                                    },
                                    required: true,
                                }],
                            },
                            {
                                model: LangModel,
                                as: 'raw_lang',
                                where: {
                                    code: lang=="any"?{ status: "active"}:lang,
                                    status: "active",
                                },
                                required: true,
                            },
                            {
                                model: LangModel,
                                as: 'translate_lang',
                                where: langTrans=="any"?{status:"active"}:{
                                    code: langTrans,
                                    status: "active",
                                },
                                required: true,
                            }
                        ],
                        limit: suggestionsLimit,
                    });

                    for(let i in videos) {
                        videos[i].dataValues.watchLater = 'no';
                        suggestions.push(videos[i]);
                    }
                }
                suggestions = _.orderBy(suggestions, ['view','likes'], ['desc','desc']);
                //Start Check video have in watch_later or not
                checkWatchLater = '';
                
                for(let i in suggestions){
                    checkWatchLater = await VideoUserModel.findOne({
                        where: {
                            type: 'watch_later',
                            video_id: suggestions[i].id,
                            user_id: user.id,
                        },
                        required: true,
                    });
                    if(checkWatchLater){
                        suggestions[i].dataValues.watchLater = "yes";
                    }else{
                        suggestions[i].dataValues.watchLater = "no";
                    }
                }

                //Start latest videos
                let latest_id = [];
                for(let i in channelSubs) {
                    let channel = channelSubs[i];
                    let videos = await VideoModel.findAll({
                        where: {
                            status: 'active',
                        },
                        order: [
                            ['createdAt','DESC'],
                        ],
                        include: [
                            {
                                model: UserModel,
                                where: { status: 'active' },
                                attributes: ['username', 'avatar'],
                                required: true,
                                include: [{
                                    model: ChannelModel,
                                    where: { 
                                        status: 'active',
                                        id: channel.channel_id,
                                    },
                                    required: true,
                                }],
                            },
                            {
                                model: LangModel,
                                as: 'raw_lang',
                                where: {
                                    code: lang=="any"?{ status: "active"}:lang,
                                    status: "active",
                                },
                                required: true,
                            },
                            {
                                model: LangModel,
                                as: 'translate_lang',
                                where: langTrans=="any"?{status:"active"}:{
                                    code: langTrans,
                                    status: "active",
                                },
                                required: true,
                            }
                        ],
                        limit: limitVideos,
                    });

                    for(let i in videos) {
                        videos[i].dataValues.watchLater = 'no';
                        latest.push(videos[i]);
                        latest_id.push(videos[i].id);
                    }
                }
                
                let videoLatestRandom = [];
                limitRandomVideos = recommendLimit - latest.length;
                if(limitRandomVideos > 0){
                    videoLatestRandom = await VideoModel.findAll({
                        where: {
                            id: { [Op.notIn]: latest_id },
                            status: 'active',
                        },
                        order: [
                            ['createdAt','DESC'],
                        ],
                        include: [
                            {
                                model: UserModel,
                                where: { 
                                    status: 'active',
                                },
                                attributes: ['username', 'avatar'], 
                                required: true,
                                include: [{
                                    model: ChannelModel,
                                    where: { 
                                        status: 'active',
                                    },
                                    required: true,
                                }],
                            },
                            {
                                model: LangModel,
                                as: 'raw_lang',
                                where: {
                                    code: lang=="any"?{ status: "active"}:lang,
                                    status: "active",
                                },
                                required: true,
                            },
                            {
                                model: LangModel,
                                as: 'translate_lang',
                                where: langTrans=="any"?{status:"active"}:{
                                    code: langTrans,
                                    status: "active",
                                },
                                required: true,
                            }
                        ],
                        limit: limitRandomVideos,
                    });
                }
                let latestMerge = [...latest, ...videoLatestRandom];
                latest = _.orderBy(latestMerge, ['createdAt'], ['desc']);
                //Start Check video have in watch_later or not
                checkWatchLater = '';
                
                for(let i in latest){
                    checkWatchLater = await VideoUserModel.findOne({
                        where: {
                            type: 'watch_later',
                            video_id: latest[i].id,
                            user_id: user.id,
                        },
                        required: true,
                    });
                    if(checkWatchLater){
                        latest[i].dataValues.watchLater = "yes";
                    }else{
                        latest[i].dataValues.watchLater = "no";
                    }
                }
            }else{
                // User login but don't sub any channel
                let videos = await this.getRecommendVideo({user, recommendLimit, latestLimit, idVideo, lang, langTrans });
                recommend = videos.recommend;
                latest = videos.latest;
            }
        }else{
            // User not login
            let videos = await this.getRecommendVideo({recommendLimit, latestLimit, idVideo, lang, langTrans });
            recommend = videos.recommend;
            latest = videos.latest;
        }

        //check channel subcribe has video
        let channelHasVideo = [];
        for(let i in suggestions){
            if(channelHasVideo.length > 0){
                for(let j in channelHasVideo){
                    if(channelHasVideo[j] != suggestions[i].user.channel.id){
                        channelHasVideo.push(suggestions[i].user.channel.id);
                    }
                }
            }else{
                channelHasVideo.push(suggestions[i].user.channel.id);
            }
        }
        if(channelHasVideo.length > 0){
            for(let i in channel){
                for(let j in channelHasVideo){
                    if(channel[i].id == channelHasVideo[j]){
                        channel[i].dataValues.hasVideo = "yes";
                    }
                }
            }
        }
        res.send({ 'message':'Lấy dữ liệu video thành công', channel, recommend, latest, suggestions  });
    }

    /**
     * Merge function to get recommend videos
     * @return {void}
     */
    static async getRecommendVideo(data) {
        let where = '';
        let checkWatchLater = '';
        if(data.idVideo){
            where = {
                status: 'active',
                id: { [Op.notIn]: [data.idVideo] },
            }
        }else{
            where = {
                status: 'active',
            }
        }
        let recommend = await VideoModel.findAll({
            where,
            order: [
                [Sequelize.fn( 'RAND')],
            ],
            include: [
                {
                    model: UserModel,
                    where: { 
                        status: 'active',
                    },
                    attributes: ['username', 'avatar'], 
                    required: true,
                    include: [{
                        model: ChannelModel,
                        where: { 
                            status: 'active',
                        },
                        required: true,
                    }],
                },
                {
                    model: LangModel,
                    as: 'raw_lang',
                    where: data.lang=="any"?{ status: "active"}:{
                        code: data.lang,
                        status: "active",
                    },
                    required: true,
                },
                {
                    model: LangModel,
                    as: 'translate_lang',
                    where: data.langTrans=="any"?{status:"active"}:{
                        code: data.langTrans,
                        status: "active",
                    },
                    required: true,
                }
            ],
            limit: data.recommendLimit,
        });
        //Start Check video have in watch_later or not
        checkWatchLater = '';
        for(let i in recommend){
            checkWatchLater = await VideoUserModel.findOne({
                where: {
                    type: 'watch_later',
                    video_id: recommend[i].id,
                    user_id: data.user ? data.user.id : 0,
                },
                required: true,
            });
            if(checkWatchLater){
                recommend[i].dataValues.watchLater = "yes";
            }else{
                recommend[i].dataValues.watchLater = "no";
            }
        }
        recommend = _.orderBy(recommend, ['view', 'likes'], ['desc', 'desc']);
        let latest = await VideoModel.findAll({
            where: {
                status: 'active',
            },
            order: [
                ['createdAt','DESC'],
            ],
            include: [
                {
                    model: UserModel,
                    where: { 
                        status: 'active',
                    },
                    required: true,
                    attributes: ['username', 'avatar'],
                    include: [{
                        model: ChannelModel,
                        where: { 
                            status: 'active',
                        },
                        required: true,
                    }],
                },
                {
                    model: LangModel,
                    as: 'raw_lang',
                    where: data.lang=="any"?{ status: "active"}:{
                        code: data.lang,
                        status: "active",
                    },
                    required: true,
                },
                {
                    model: LangModel,
                    as: 'translate_lang',
                    where: data.langTrans=="any"?{status:"active"}:{
                        code: data.langTrans,
                        status: "active",
                    },
                    required: true,
                },
            ],
            limit: data.latestLimit,
            
        });
        //Start Check video have in watch_later or not
        checkWatchLater = '';
        for(let i in latest){
            checkWatchLater = await VideoUserModel.findOne({
                where: {
                    type: 'watch_later',
                    video_id: latest[i].id,
                    user_id: data.user ? data.user.id : 0,
                },
                required: true,
            });
            if(checkWatchLater){
                latest[i].dataValues.watchLater = "yes";
            }else{
                latest[i].dataValues.watchLater = "no";
            }
        }
        return { 
            recommend,
            latest,
        }
    }

    /**
     * User act video: remove video watch later, watch later, like, dislike video by video_id
     * @return {void}
     */
    static async action(req, res) {
        const { type } = req.query;
        const { id } = req.params;
        const user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message': 'Thông tin đăng nhập không chính xác' })
        }
        if(type){
            if(type === 'remove_watch_later' || type === 'watch_later' || type === 'like' || type === 'dislike'){
                const videoExist = await VideoModel.findOne({
                    where: {
                        id: id ? id : 0,
                        status: 'active',
                    },
                    include: {
                        model: UserModel,
                        where: {
                            status: 'active',
                        },
                        attributes: ['username', 'avatar'],
                    },
                    required: true,
                });
                if(videoExist){
                    let videoResult = '';
                    if(type === 'watch_later'){
                        videoResult = await VideoUserModel.findOne({
                            where: {
                                type,
                                video_id: id,
                                user_id: user.id,
                            },
                            required: true,
                        });
                        if(!videoResult){
                            const videoAction = await VideoUserModel.create({
                                type,
                                video_id: id,
                                user_id: user.id,
                            });
                            return res.send({ 'message': 'Thêm video vào danh sách xem sau thành công', videoAction });
                        }else{
                            return res.status(403).send({ 'message': 'Video này đã tồn tại trong danh sách xem sau' });
                        }
                    }else if(type === 'remove_watch_later'){
                        videoResult = await VideoUserModel.findOne({
                            where: {
                                type: 'watch_later',
                                video_id: id,
                                user_id: user.id,
                            },
                            required: true,
                        });
                        if(videoResult){
                            await videoResult.destroy();
                            return res.send({ 'message': 'Xóa video khỏi danh sách xem sau thành công' });
                        }else{
                            return res.status(404).send({ 'message': 'Video này không tồn tại trong danh sách xem sau' });
                        }
                    }else if(type === 'like'){
                        videoResult = await VideoUserModel.findOne({
                            where: {
                                type,
                                video_id: id,
                                user_id: user.id,
                            },
                            required: true,
                        });
                        if(videoResult){
                            await videoResult.destroy();
                            await videoExist.update({
                                likes: videoExist.likes - 1,
                            });
                            return res.send({ 'message': 'Bỏ like video thành công' });
                        }else{
                            let videoAction = '';
                            const videoCheck = await VideoUserModel.findOne({
                                where: {
                                    type: 'dislike',
                                    video_id: id,
                                    user_id: user.id,
                                },
                                required: true,
                            });
                            if(!videoCheck){
                                videoAction = await VideoUserModel.create({
                                    type,
                                    video_id: id,
                                    user_id: user.id,
                                });
                            }else{
                                videoAction = await videoCheck.update({
                                    type: 'like',
                                });
                                await videoExist.update({
                                    dislikes: videoExist.dislikes - 1,
                                });
                            }
                            await videoExist.update({
                                likes: videoExist.likes + 1,
                            });
                            return res.send({ 'message': 'Like video thành công', videoAction });
                        }
                    }else if(type === 'dislike'){
                        videoResult = await VideoUserModel.findOne({
                            where: {
                                type,
                                video_id: id,
                                user_id: user.id,
                            },
                            required: true,
                        });
                        if(videoResult){
                            await videoResult.destroy();
                            await videoExist.update({
                                dislikes: videoExist.dislikes - 1,
                            });
                            return res.send({ 'message': 'Bỏ dislike video thành công' });
                        }else{
                            let videoAction = '';
                            const videoCheck = await VideoUserModel.findOne({
                                where: {
                                    type: 'like',
                                    video_id: id,
                                    user_id: user.id,
                                },
                                required: true,
                            });
                            if(!videoCheck){
                                videoAction = await VideoUserModel.create({
                                    type,
                                    video_id: id,
                                    user_id: user.id,
                                });
                            }else{
                                videoAction = await videoCheck.update({
                                    type: 'dislike',
                                });
                                await videoExist.update({
                                    likes: videoExist.likes - 1,
                                });
                            }
                            await videoExist.update({
                                dislikes: videoExist.dislikes + 1,
                            });
                            
                            return res.send({ 'message': 'Dislike video thành công', videoAction });
                        }
                    }
                }else{
                    return res.status(404).send({ 'message': 'Video này không tồn tại' });
                }
            }else{
                return res.status(403).send({ 'message': 'Không thể thực hiện hành động' });
            }
        }else{
            return res.status(403).send({ 'message': 'Không thể thực hiện hành động' });
        }
    }

    /**
     * Create Or Update history watch video
     * @return {void}
     */
    static async historyWatch(req, res) {
        let { slug } = req.params;
        // slug=encodeURIComponent(slug)
        let user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message': 'Thông tin đăng nhập không chính xác' })
        }
        const video = await VideoModel.findOne({
            where: {
                slug,
                status: 'active',
            },
            include: {
                model: UserModel,
                where: {
                    status: 'active',
                },
                attributes: ['username', 'avatar'],
            },
            required: true,
        });
        if(!video){
            return res.status(404).send({ 'message': 'Video này không tồn tại' });
        }
        if(user.history_status === 'active'){
            let history = await HistoryModel.findOne({
                where: {
                    video_id: video.id,
                    user_id: user.id,
                },
                required: true,
            });
            if(history){
                let count = history.count += 1;
                history = await history.update({
                    status: 'active',
                    count,
                });
            }else{
                history = await HistoryModel.create({
                    status: 'active',
                    video_id: video.id,
                    user_id: user.id,
                });
            }
            return res.send({ 'message': 'Thêm thành công video vào danh sách lịch sử xem video', history });
        }else{
            return res.status(400).send({ 'message': 'Tài khoản của bạn không kích hoạt chức năng lưu lịch sử xem' });
        }
    }

    /**
     * Get list history videos watch
     * @return {void}
     */
    static async listHistory(req, res) {
        const user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message': 'Thông tin đăng nhập không chính xác' })
        }
        const { lang, langTrans } = req.query;
        const findHistory = await HistoryModel.findAll({
            where: {
                user_id: user.id,
                status: 'active',
            },
            order: [
                ["updatedAt", "DESC"]
            ],
            limit: 20,
            required: true,
        });
        let history = [];
        if(findHistory.length){
            for(let i in findHistory){
                let video = await VideoModel.findOne({
                    where: {
                        id: findHistory[i].video_id,
                        status: 'active',
                    },
                    include: [
                        {
                            model: UserModel,
                            attributes: ['id', 'username', 'history_status'],
                            where: {
                                status: 'active',
                            },
                            include: [{
                                model: ChannelModel,
                                where: {
                                    status: 'active',
                                },
                                required: true,
                            }]
                        },
                        {
                            model: LangModel,
                            as: 'raw_lang',
                            where: {
                                code: lang ? lang : "en",
                                status: "active",
                            },
                            required: true,
                        },
                        {
                            model: LangModel,
                            as: 'translate_lang',
                            where: {
                                code: langTrans ? langTrans : "vi",
                                status: "active",
                            },
                            required: true,
                        },
                    ]
                });
                if(video){
                    history.push(video);
                }
            }
        }
        return res.send({ 'message': 'Lấy thành công danh sách lịch sử xem video', history });
    }

    /**
     * Stop/ Continue save history watching videos
     * @return {void}
     */
    static async historyAction(req, res) {
        const { history_status } = await req.query;
        let user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message' : 'Thông tin đăng nhập không chính xác' });
        }
        if(history_status != 'active' && history_status != 'inactive'){
            return res.status(403).send({ 'message': 'Không thể thực hiện hành động' });
        }
        if(user.history_status === 'active' && history_status === 'active'){
            return res.status(400).send({ 'message': 'Tài khoản của bạn đã được bật lưu lịch sử xem video' });
        }else if(user.history_status === 'inactive' && history_status === 'inactive'){
            return res.status(400).send({ 'message': 'Tài khoản của bạn đã được tắt lưu lịch sử xem video' });
        }
        let historyAction = '';
        if(history_status === 'active'){
            historyAction = 'Tiếp tục lưu ';
        }else if(history_status === 'inactive'){
            historyAction = 'Tạm dừng lưu ';
        }
        user = await user.update({
            history_status,
        });
        let token = await JWTService.generateTokenByUser(user);
        const activeToken = await ActiveTokenModel.findOne({ where: { user_id: user.id } });
        activeToken.update({ token });
        return res.send({ 'message': historyAction + 'lịch sử video thành công', token });
    }

    /**
     * clear all history watching videos
     * @return {void}
     */
    static async historyClear(req, res) {
        const user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message': 'Thông tin đăng nhập không chính xác' })
        }
        const history = await HistoryModel.findAll({
            where: {
                user_id: user.id,
                status: 'active',
            }
        });
        let historyDelete = [];
        if(history.length){
            for(let i in history){
                let deleteHistory = await history[i].update({
                    status: 'deleted',
                });
                historyDelete.push(deleteHistory);
            }
            return res.send({ 'message':'Xóa lịch sử xem video thành công', historyDelete });
        }else{
            return res.status(404).send({ 'message':'Lịch sử xem video trống' });
        }
    }

    /**
     * search video in history watching videos
     * @return {void}
     */
    static async searchHistory(req, res) {
        const { key_words, lang, langTrans } = req.query;
        const user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message': 'Thông tin đăng nhập không chính xác' })
        }
        if(key_words) {
            let where = { status: 'active' };
            if(key_words) {
                where.title = { [Op.like]: '%' + key_words + '%' };
            }
            const video = await VideoModel.findAll({
                where,
                order: [
                    ['view', 'DESC'],
                    ['likes', 'DESC'],
                    ['createdAt', 'DESC']
                ],
                include: [
                    {
                        model: UserModel,
                        where: { status: 'active' },
                        attributes: ['username', 'avatar'],
                        include: [{
                            model: ChannelModel,
                            status: 'active',
                            required: true,
                        }],
                    },
                    {
                        model: LangModel,
                        as: 'raw_lang',
                        where: {
                            code: lang ? lang : "en",
                            status: "active",
                        },
                        required: true,
                    },
                    {
                        model: LangModel,
                        as: 'translate_lang',
                        where: {
                            code: langTrans ? langTrans : "vi",
                            status: "active",
                        },
                        required: true,
                    },
                ],
                required: true,
            });
            let videoSearch = [];
            let videoHistory = '';
            if(video.length){
                for(let i in video){
                    videoHistory = await HistoryModel.findOne({
                        where: {
                            user_id: user.id,
                            video_id: video[i].id,
                            status: 'active',
                        },
                        order: [
                            ['updatedAt', 'DESC'],
                        ],
                        required: true,
                    });
                    if(videoHistory){
                        videoSearch.push(video[i]);
                    }
                }
            }else{
                return res.status(404).send({ 'message': 'Không tìm thấy kết quả nào' });
            }
            return res.send({ 'message': 'Lấy dữ liệu video thành công', videoSearch });
        }else {
            return res.status(404).send({ 'message': 'Không tìm thấy kết quả nào' });
        }
    }

    /**
     * Get list videos watch later
     * @return {void}
     */
    static async listWatchLater(req, res) {
        const user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message': 'Thông tin đăng nhập không chính xác' })
        }
        const { lang, langTrans } = req.query;
        const findWatchLater = await VideoUserModel.findAll({
            where: {
                user_id: user.id,
                type: 'watch_later',
            },
            order: [
                ["updatedAt", "DESC"]
            ],
            required: true,
        });
        let watchlater = [];
        if(findWatchLater.length){
            for(let i in findWatchLater){
                let video = await VideoModel.findOne({
                    where: {
                        id: findWatchLater[i].video_id,
                        status: 'active',
                    },
                    include: [
                        {
                            model: UserModel,
                            where: {
                                status: 'active',
                            },
                            attributes: ['id', 'username', 'history_status'],
                            include: [{
                                model: ChannelModel,
                                where: {
                                    status: 'active',
                                },
                                required: true,
                            }]
                        },
                        {
                            model: LangModel,
                            as: 'raw_lang',
                            where: {
                                code: lang ? lang : "en",
                                status: "active",
                            },
                            required: true,
                        },
                        {
                            model: LangModel,
                            as: 'translate_lang',
                            where: {
                                code: langTrans ? langTrans : "vi",
                                status: "active",
                            },
                            required: true,
                        },
                    ]
                });
                if(video){
                    watchlater.push(video);
                }
            }
        }
        return res.send({ 'message': 'Lấy thành công danh sách video xem sau', watchlater, findWatchLater });
    }

    /**
     * Get list liked videos
     * @return {void}
     */
    static async listLikedVideo(req, res) {
        const user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message': 'Thông tin đăng nhập không chính xác' })
        }
        const { lang, langTrans } = req.query;
        const listLiked = await VideoUserModel.findAll({
            where: {
                type: 'like',
                user_id: user.id,
            },
            order: [
                ['createdAt', 'DESC']
            ],
            limit: 20,
            required: true,
        });
        let listLikedVideo = [];
        for(let i in listLiked){
            let likedVideo = await VideoModel.findOne({
                where: {
                    id: listLiked[i].video_id,
                    status: 'active',
                },
                include: [
                    {
                        model: UserModel,
                        where: {
                            status: 'active',
                        },
                        attributes: ['id', 'username'],
                        include: [{
                            model: ChannelModel,
                            where: {
                                status: 'active',
                            },
                            required: true,
                        }]
                    },
                    {
                        model: LangModel,
                        as: 'raw_lang',
                        where: {
                            code: lang ? lang : "en",
                            status: "active",
                        },
                        required: true,
                    },
                    {
                        model: LangModel,
                        as: 'translate_lang',
                        where: {
                            code: langTrans ? langTrans : "vi",
                            status: "active",
                        },
                        required: true,
                    },
                ],
                required: true,
            });
            if(likedVideo){
                listLikedVideo.push(likedVideo);
            }
        }
        return res.send({ 'message': 'Lấy thành công danh sách like video', listLikedVideo });
    }

    /**
     * search video in like videos
     * @return {void}
     */
    static async searchLikeVideo(req, res) {
        const { key_words, lang, langTrans } = req.query;
        const user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message': 'Thông tin đăng nhập không chính xác' })
        }
        if(key_words) {
            let where = { status: 'active' };
            if(key_words) {
                where.title = { [Op.like]: '%' + key_words + '%' };
            }
            const video = await VideoModel.findAll({
                where,
                order: [
                    ['view', 'DESC'],
                    ['likes', 'DESC'],
                    ['createdAt', 'DESC']
                ],
                include: [
                    {
                        model: UserModel,
                        where: { status: 'active' },
                        attributes: ['username', 'avatar'],
                        include: [{
                            model: ChannelModel,
                            status: 'active',
                            required: true,
                        }],
                    },
                    {
                        model: LangModel,
                        as: 'raw_lang',
                        where: {
                            code: lang ? lang : "en",
                            status: "active",
                        },
                        required: true,
                    },
                    {
                        model: LangModel,
                        as: 'translate_lang',
                        where: {
                            code: langTrans ? langTrans : "vi",
                            status: "active",
                        },
                        required: true,
                    },
                ],
                required: true,
            });
            let videoSearch = [];
            let videosLike = '';
            if(video.length){
                for(let i in video){
                    videosLike = await VideoUserModel.findOne({
                        where: {
                            user_id: user.id,
                            video_id: video[i].id,
                            type: 'like',
                        },
                        order: [
                            ['updatedAt', 'DESC'],
                        ],
                        required: true,
                    });
                    if(videosLike){
                        videoSearch.push(video[i]);
                    }
                }
            }else{
                return res.status(404).send({ 'message': 'Không tìm thấy kết quả nào' });
            }
            return res.send({ 'message': 'Lấy dữ liệu video thành công', videoSearch });
        }else {
            return res.status(404).send({ 'message': 'Không tìm thấy kết quả nào' });
        }
    }

    /**
     * Get list videos from 20 channels sub => subcriptions page
     * @params req, res
     * @return {void}
     */
    static async getListVideoSub(req, res) {
        let { suggestionsLimit, lang, langTrans } = req.query;
        const user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message': 'Thông tin đăng nhập không chính xác' })
        }
        let suggestions = [], checkWatchLater = '';
        suggestionsLimit = suggestionsLimit ? parseInt(suggestionsLimit) : 12;
        let channelSubSuggestions, channel = [];
        //Start get data 20 information channel sub to make videos from subcriptions page
        channelSubSuggestions = await SubcribeChannel.findAll({
            where: {
                user_id: user.id,
                status: 'sub',
            },
            order: [ [Sequelize.fn( 'RAND')] ],
            limit: 20,
        });

        if(channelSubSuggestions.length > 0){
            for(let i in channelSubSuggestions){
                let getChannel = await ChannelModel.findOne({
                    where: {
                        id: channelSubSuggestions[i].channel_id,
                        status: 'active',
                    },
                    include: {
                        model: UserModel,
                        attributes: ['username', 'avatar'],
                        where: {
                            status: 'active',
                        },
                    },
                    required: true,
                });

                if(getChannel){
                    channel.push(getChannel);
                }
            }
        }

        //if user have sub channel => show videos from channel user sub
        if(channelSubSuggestions.length){
            //Start suggestions videos
            for(let i in channelSubSuggestions) {
                let channel = channelSubSuggestions[i];
                let videos = await VideoModel.findAll({
                    where: {
                        status: 'active',
                    },
                    order: [
                        [Sequelize.fn( 'RAND')],
                    ],
                    include: [
                        {
                            model: UserModel,
                            where: { status: 'active' },
                            attributes: ['username', 'avatar'],
                            required: true,
                            include: [{
                                model: ChannelModel,
                                where: { 
                                    status: 'active',
                                    id: channel.channel_id,
                                },
                                required: true,
                            }],
                        },
                        {
                            model: LangModel,
                            as: 'raw_lang',
                            where: {
                                code: lang ? lang : "en",
                                status: "active",
                            },
                            required: true,
                        },
                        {
                            model: LangModel,
                            as: 'translate_lang',
                            where: {
                                code: langTrans ? langTrans : "vi",
                                status: "active",
                            },
                            required: true,
                        },
                    ],
                    limit: suggestionsLimit,
                });

                for(let i in videos) {
                    videos[i].dataValues.watchLater = 'no';
                    suggestions.push(videos[i]);
                }
            }
            suggestions = _.orderBy(suggestions, ['view','likes'], ['desc','desc']);
            //Start Check video have in watch_later or not
            checkWatchLater = '';
            
            for(let i in suggestions){
                checkWatchLater = await VideoUserModel.findOne({
                    where: {
                        type: 'watch_later',
                        video_id: suggestions[i].id,
                        user_id: user.id,
                    },
                    required: true,
                });
                if(checkWatchLater){
                    suggestions[i].dataValues.watchLater = "yes";
                }else{
                    suggestions[i].dataValues.watchLater = "no";
                }
            }
        }

        //check channel subcribe has video
        let channelHasVideo = [];
        for(let i in suggestions){
            if(channelHasVideo.length > 0){
                for(let j in channelHasVideo){
                    if(channelHasVideo[j] != suggestions[i].user.channel.id){
                        channelHasVideo.push(suggestions[i].user.channel.id);
                    }
                }
            }else{
                channelHasVideo.push(suggestions[i].user.channel.id);
            }
        }
        if(channelHasVideo.length > 0){
            for(let i in channel){
                for(let j in channelHasVideo){
                    if(channel[i].id == channelHasVideo[j]){
                        channel[i].dataValues.hasVideo = "yes";
                    }
                }
            }
        }
        res.send({ 'message':'Lấy dữ liệu video thành công', channel, suggestions  });
    }

    /**
     * Get list trending videos
     * @params req, res
     * @return {void}
     */
    static async getTrendingVideo(req, res) {
        let { trendingLimit, lang, langTrans } = req.query;
        trendingLimit = trendingLimit ? parseInt(trendingLimit) : 12;
        let toDate = new moment().format();
        let fromDate = moment().subtract(30, 'day');
        const videoTrend = await VideoModel.findAll({
            where: {
                status: 'active',
                createdAt: { [Op.between]: [fromDate, toDate] },
            },
            order: [
                ['view', 'DESC'],
                ['likes', 'DESC'],
                ['createdAt', 'DESC'],
            ],
            include: [
                {
                    model: UserModel,
                    where: { status: 'active' },
                    required: true,
                    attributes: ['username', 'avatar'],
                    include: [
                        {
                            model: ChannelModel,
                            where: { status: 'active' },
                            required: true,
                        },

                    ],
                },
                {
                    model: LangModel,
                    as: 'raw_lang',
                    where: {
                        code: lang ? lang : "en",
                        status: "active",
                    },
                    required: true,
                },
                {
                    model: LangModel,
                    as: 'translate_lang',
                    where: {
                        code: langTrans ? langTrans : "vi",
                        status: "active",
                    },
                    required: true,
                },
            ],
            limit: trendingLimit,
        });
        res.send({ 'message':'Lấy dữ liệu video thành công', videoTrend  });
    }

    /**
     * Payment videos
     * @params req, res
     * @return {void}
     */
    static async paymentVideo(req, res) {
        let user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message': 'Thông tin đăng nhập không chính xác' })
        }
        const { id } = req.params;
        const video = await VideoModel.findOne({
            where: {
                id,
                status: 'active',
            },
            include:[{
                model: UserModel,
                where: {
                    status: 'active',
                },
                attributes: ['id', 'username', 'avatar'],
            }]
        });
        if(video) {
            if(video.price > 0){
                const videoPayment = await VideoPaymentModel.findOne({
                    where: {
                        video_id: id,
                        user_buy: user.id,
                    }
                });
                if(!videoPayment){
                    if(user.balance - video.price >= 0){
                        let balance = user.balance - video.price;
                        user = await user.update({
                            balance,
                        });
                        let token = await JWTService.generateTokenByUser(user);
                        const activeToken = await ActiveTokenModel.findOne({ where: { user_id: user.id } });
                        activeToken.update({ token });
                        let seller = await UserModel.findOne({
                            where: {
                                id: video.user.id,
                            },
                        });
                        const setting = await SettingController.getSettingValueByKey("more_commission");
                        let balanceSeller = 0;
                        if(setting){
                            let feeCommission = video.price * setting / 100;
                            if(setting == 0){
                                balanceSeller = video.price + seller.balance;
                            }else{
                                balanceSeller = seller.balance + (video.price - feeCommission);
                            }
                        }
                        await seller.update({
                            balance: balanceSeller,
                        });
                        let tokenSeller = await JWTService.generateTokenByUser(seller);
                        const activeTokenSeller = await ActiveTokenModel.findOne({ where: { user_id: seller.id } });
                        await activeTokenSeller.update({ token: tokenSeller });
                        await VideoPaymentModel.create({
                            video_id: id,
                            user_buy: user.id,
                            user_sell: video.user_id,
                            price: video.price,
                            commission: setting ? setting : 0,
                            amount_buyer: user.balance,
                            amount_seller: balanceSeller,
                        });
                        return res.send({ 'message' : 'Trả phí video thành công.', video, token, tokenSeller });
                    }else{
                        return res.status(403).send({ 'message' : 'Số dư hiện tại của bạn không đủ để thanh toán. Vui lòng nạp thêm tiền.' });
                    }
                }else{
                    return res.status(400).send({ 'message' : 'Bạn đã trả phí trước đó cho video này.' });
                }
            }else{
                return res.status(400).send({ 'message' : 'Video này không cần phải trả phí.' });
            }
        }else{
            return res.status(404).send({ 'message' : 'Video này không tồn tại.' });
        }
    }

    static async createPreviewVideo(req,res){
        if(req.file){
            let filePath=req.file.path.split("assets\\videos")[1]
            res.send(path.join("static/videos",filePath))
        }else{
            res.status(400).send({ 'message' : 'Video bạn upload không thể nhận diện!' });
        }
    }

    static async deletePreviewVideo(req,res){
        let temp = req.filePath.split(path.sep);
        temp.shift();
        let link = temp.join(path.sep); 
        link = path.join(global.BASE_DIR, "assets/videos", req.filePath);

        fs.unlink(link, (err) => {
            if (err) logger.error(`Error when delete file ${link} !`,err);
            logger.info(`Delete file ${link} successfully!`)
        });
        res.send("ok")
    }
}
module.exports = VideoController;