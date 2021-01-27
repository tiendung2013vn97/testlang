const express = require('express');
const videoRouter = express.Router();
const VideoController = require('../controllers/video.controller'); 
const VideoMiddleware = require('../middlewares/video.middleware');
const { accessToken } = require('../middlewares/auth.middleware');
const multer = require("multer");
const commonService=require("../services/common.service")
const path=require("path")
const fs=require('fs')

// SET STORAGE
const storage = multer.diskStorage({
destination: function (req, file, cb) {
  let now=new Date()
  let storeFolder=`${BASE_DIR}/assets/videos/${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()}`
  fs.existsSync( storeFolder) || fs.mkdirSync(storeFolder,{ recursive: true });
    cb(null, storeFolder);
},
filename: function (req, file, cb) {
    let fileName=`${commonService.initFileName()}${path.extname(file.originalname)}`
    cb(null, fileName);
},
});

const upload = multer({ storage: storage });


/**
 * Middlewares
 */
videoRouter.post('/create', (req, res, next) => VideoMiddleware.createAndUpdate(req, res, next));
videoRouter.post('/update/:id', (req, res, next) => VideoMiddleware.createAndUpdate(req, res, next));

/**
 * Video endpoint list
 */
videoRouter.get('/search', (req, res) => VideoController.searchVideo(req, res));
videoRouter.get('/detail/:slug', (req, res) => VideoController.getDetailVideo(req, res));
videoRouter.get('/all', (req, res) => VideoController.getList(req, res));
videoRouter.get('/recommend', (req, res) => VideoController.getListVideoRecommend(req, res));
videoRouter.get('/video-subscriptions', accessToken, (req, res) => VideoController.getListVideoSub(req, res));
videoRouter.get('/update/:id', accessToken, (req, res) => VideoController.edit(req, res));
videoRouter.get('/video-update/:slug', accessToken, (req, res) => VideoController.videoUpdate(req, res));
videoRouter.get('/history/:slug', accessToken, (req, res) => VideoController.historyWatch(req, res));
videoRouter.get('/history', accessToken, (req, res) => VideoController.listHistory(req, res));
videoRouter.get('/search/history', accessToken, (req, res) => VideoController.searchHistory(req, res));
videoRouter.get('/watch-later', accessToken, (req, res) => VideoController.listWatchLater(req, res));
videoRouter.get('/liked', accessToken, (req, res) => VideoController.listLikedVideo(req, res));
videoRouter.get('/search/liked', accessToken, (req, res) => VideoController.searchLikeVideo(req, res));
videoRouter.get('/trending', (req, res) => VideoController.getTrendingVideo(req, res));

videoRouter.post('/create', accessToken, (req, res) => VideoController.create(req, res));
videoRouter.post('/update/:id', accessToken, (req, res) => VideoController.update(req, res));
videoRouter.post('/delete/:id', accessToken, (req, res) => VideoController.delete(req, res));
videoRouter.post('/action/:id', accessToken, (req, res) => VideoController.action(req, res));
videoRouter.post('/history', accessToken, (req, res) => VideoController.historyAction(req, res));
videoRouter.post('/clear-history', accessToken, (req, res) => VideoController.historyClear(req, res));
videoRouter.post('/payment-video/:id', accessToken, (req, res) => VideoController.paymentVideo(req, res));

videoRouter.post('/create-preview-video', accessToken, upload.single("video"), (req, res) => VideoController.createPreviewVideo(req, res));
videoRouter.delete('/delete-preview-video', accessToken, (req, res) => VideoController.deletePreviewVideo(req, res));
module.exports = videoRouter;