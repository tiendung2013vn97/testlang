const express = require('express');
const categoryRouter = express.Router();
const CategoryController = require('../controllers/category.controller');
const CategoryMiddleware = require('../middlewares/category.middleware');
const { accessToken } = require('../middlewares/auth.middleware');

/**
 * Middleware category.
 */
categoryRouter.post('/create', (req, res, next) => CategoryMiddleware.createAndEdit(req, res, next));
categoryRouter.post('/edit/:id', (req, res, next) => CategoryMiddleware.createAndEdit(req, res, next));

/**
 * category endpoint list.
 */
categoryRouter.get('/', (req, res) => CategoryController.getList(req, res));
categoryRouter.get('/all', (req, res) => CategoryController.getAllCategories(req, res));
categoryRouter.post('/create', accessToken, (req, res) => CategoryController.create(req, res));
categoryRouter.get('/edit/:id', accessToken, (req, res) => CategoryController.getEdit(req, res));
categoryRouter.post('/edit/:id', accessToken, (req, res) => CategoryController.edit(req, res));
categoryRouter.post('/delete/:id', accessToken, (req, res) => CategoryController.delete(req, res));

module.exports = categoryRouter;