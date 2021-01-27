const { accessToken } = require('../middlewares/auth.middleware');
const router = require('express').Router();
const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');
const settingRoutes = require('./setting.routes');
const videoRoutes = require('./video.routes');
const categoryRoutes = require('./category.routes');
const newsRoutes = require('./news.routes');
const channelRoutes = require('./channel.routes');
const commentRoutes = require('./comment.routes');
const paymentRoutes = require('./payment.routes');
const transactionRoutes = require('./transaction.routes');
const pageRoutes = require('./page.routes');
const translateRoutes = require('./translate.route');
const langRoutes = require('./lang.routes');
const path=require("path")
const express=require("express")

/**
 * Registers of the api routes.
 * @module routes
 */

router.use('/static', express.static(path.join(global.BASE_DIR, 'assets')))
router.use('/user', accessToken, userRoutes);
router.use('/transactions', transactionRoutes);
router.use('/settings', settingRoutes);
router.use('/auth', authRoutes);
router.use('/videos', videoRoutes);
router.use('/categories', categoryRoutes);
router.use('/news', newsRoutes);
router.use('/channel', channelRoutes);
router.use('/comments', commentRoutes);
router.use('/payments', paymentRoutes);
router.use('/pages', pageRoutes);
router.use('/translate', translateRoutes);
router.use('/langs', langRoutes);

module.exports = router;
