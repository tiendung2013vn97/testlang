const express = require('express');
const authRouter = express.Router();
const AuthController = require('../controllers/auth.controller');
const { AuthMiddleware } = require('../middlewares/auth.middleware');

/**
 * Auth endpoint middleware list.
 */
authRouter.post('/login', (req, res, next) => AuthMiddleware.login(req, res, next));
authRouter.post('/register', (req, res, next) => AuthMiddleware.register(req, res, next));
authRouter.post('/forgot-pass', (req, res, next) => AuthMiddleware.forgotPassword(req, res, next));
authRouter.post('/facebook', (req , res , next) => AuthMiddleware.loginFacebook(req , res , next)); 
authRouter.post('/google', (req, res, next) => AuthMiddleware.loginGoogle(req, res ,next));

/**
 * Auth endpoint list.
 */
authRouter.post('/login', (req, res) => AuthController.login(req, res));
authRouter.post('/register', (req, res) => AuthController.register(req, res));
authRouter.post('/confirm-register/', (req, res) => AuthController.confirmRegister(req, res));
authRouter.post('/forgot-pass', (req, res) => AuthController.forgotPassword(req, res));
authRouter.get('/client-id' , (req , res) => AuthController.getClientId(req ,res));
authRouter.post('/facebook', (req , res) => AuthController.loginFacebook(req , res)); 
authRouter.get('/get-info-google' , (req , res) => AuthController.verify(req , res));
authRouter.post('/google', (req, res) => AuthController.loginGoogle(req, res));
authRouter.post('/check', (req, res) => AuthController.checkTokenInfo(req, res));
module.exports = authRouter;
