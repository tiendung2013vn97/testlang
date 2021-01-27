const express = require('express');
const channelRouter = express.Router();
const ChannelController = require('../controllers/channel.controller'); 
const ChannelMiddleware = require('../middlewares/channel.middleware');
const { accessToken } = require('../middlewares/auth.middleware');
/**
 * Middlewares
 */
channelRouter.post('/create', (req, res, next) => ChannelMiddleware.createAndUpdate(req, res, next));
channelRouter.post('/update/:id', (req, res, next) => ChannelMiddleware.createAndUpdate(req, res, next));
channelRouter.post('/update-channel-user/:slug', (req, res, next) => ChannelMiddleware.createAndUpdate(req, res, next));
/**
 * Chanel endpoint list
 */

channelRouter.get('/', (req, res) => ChannelController.getList(req, res));
channelRouter.get('/get-channel-sub', accessToken, (req, res) => ChannelController.getListChannelSub(req, res));
channelRouter.get('/check-user-channel', accessToken, (req, res) => ChannelController.checkExist(req, res));
channelRouter.post('/sub/:id', accessToken, (req, res) => ChannelController.subChannel(req, res));
channelRouter.post('/create', accessToken, (req, res) => ChannelController.create(req, res));
channelRouter.post('/update/:id', accessToken, (req, res) => ChannelController.update(req, res));
channelRouter.get('/update/:id',accessToken, (req, res) => ChannelController.edit(req, res));
channelRouter.get('/detail/:slug', (req, res) => ChannelController.getDetailChannel(req, res));
channelRouter.get('/detail-channel-user/:slug', accessToken, (req, res) => ChannelController.getDetailChannelUser(req, res));
channelRouter.post('/update-channel-user/:slug', accessToken, (req, res) => ChannelController.updateChannelUser(req, res));
module.exports = channelRouter;