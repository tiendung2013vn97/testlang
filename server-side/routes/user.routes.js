const express = require('express');
const userRouter = express.Router();
const UserController = require('../controllers/user.controller'); 
const UserMiddleware = require('../middlewares/user.middleware');
const { accessToken } = require('../middlewares/auth.middleware');

/**
 * Middlewares
 */
userRouter.post('/update', (req, res, next) => UserMiddleware.updateProfile(req, res, next));;

/**
 * User endpoint list
 */
userRouter.get('/', accessToken, (req, res) => UserController.getListUser(req, res));
userRouter.get('/:id/detail', (req, res) => UserController.getDetailUser(req, res));
userRouter.post('/:id/block', (req, res) => UserController.blockUser(req, res));
userRouter.post('/:id/unblock', (req, res) => UserController.unblockUser(req, res));
userRouter.post('/:id/switch-type', (req, res) => UserController.switchType(req, res));
userRouter.post('/update', accessToken, (req, res) => UserController.updateProfile(req, res));
userRouter.get('/settings', accessToken, (req, res) => UserController.getUserSettings(req, res));
userRouter.put('/settings', accessToken, (req, res) => UserController.updateUserSettings(req, res));

module.exports = userRouter;