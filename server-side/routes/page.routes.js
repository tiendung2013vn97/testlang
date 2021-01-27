const express = require('express');
const pageRouter = express.Router();
const PageMiddleware = require('../middlewares/page.middleware');
const PageController = require('../controllers/page.controller'); 
const { accessToken } = require('../middlewares/auth.middleware');
/**
 * Middlewares
 */
pageRouter.post('/create', (req, res, next) => PageMiddleware.createAndUpdate(req, res, next));
pageRouter.post('/update/:id', (req, res, next) => PageMiddleware.createAndUpdate(req, res, next));

/**
 * New endpoint list
 */
pageRouter.get('/', (req, res) => PageController.getList(req, res));
pageRouter.get('/all', (req, res) => PageController.getAllPages(req, res));
pageRouter.post('/create', accessToken, (req, res) => PageController.create(req, res));
pageRouter.post('/update/:id', accessToken, (req, res) => PageController.update(req, res));
pageRouter.get('/update/:id', accessToken, (req, res) => PageController.edit(req, res));
pageRouter.get('/detail/:slug', (req, res) => PageController.getDetailPage(req, res));
pageRouter.post('/delete/:id', accessToken, (req, res) => PageController.delete(req, res));
module.exports = pageRouter;