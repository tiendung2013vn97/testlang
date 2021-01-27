const express = require('express');
const newRouter = express.Router();
const NewsController = require('../controllers/news.controller'); 
const NewsMiddleware = require('../middlewares/news.middleware');
const { accessToken } = require('../middlewares/auth.middleware');
/**
 * Middlewares
 */
newRouter.post('/create', (req, res, next) => NewsMiddleware.createAndUpdate(req, res, next));
newRouter.post('/update/:id', (req, res, next) => NewsMiddleware.createAndUpdate(req, res, next));

/**
 * New endpoint list
 */
newRouter.get('/', (req, res) => NewsController.getList(req, res));
newRouter.post('/create', accessToken, (req, res) => NewsController.create(req, res));
newRouter.post('/update/:id', accessToken, (req, res) => NewsController.update(req, res));
newRouter.get('/update/:id', accessToken, (req, res) => NewsController.edit(req, res));
newRouter.post('/delete/:id', accessToken, (req, res) => NewsController.delete(req, res));
module.exports = newRouter;