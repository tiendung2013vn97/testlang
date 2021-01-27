const express = require('express');
const langRouter = express.Router();
const { accessToken } = require('../middlewares/auth.middleware');
const LangsMiddleware = require('../middlewares/langs.middleware');
const LangsController = require("../controllers/langs.controller");
/**
 * Middlewares
 */
langRouter.post('/create', (req, res, next) => LangsMiddleware.createAndUpdate(req, res, next));
langRouter.post('/update/:id', (req, res, next) => LangsMiddleware.createAndUpdate(req, res, next));

/**
 * New endpoint list
 */
langRouter.get('/', (req, res) => LangsController.getList(req, res));
langRouter.get('/all', (req, res) => LangsController.getAllLanguages(req, res));
langRouter.get('/update/:id', accessToken, (req, res) => LangsController.edit(req, res));
langRouter.post('/create', accessToken, (req, res) => LangsController.create(req, res));
langRouter.post('/update/:id', accessToken, (req, res) => LangsController.update(req, res));
langRouter.post('/delete/:id', accessToken, (req, res) => LangsController.delete(req, res));
module.exports = langRouter;