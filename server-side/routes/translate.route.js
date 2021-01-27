const express = require('express');
const translateRoute = express.Router();
const TranslateController = require('../controllers/translate.controller'); 
const { accessToken } = require('../middlewares/auth.middleware');
const TranslateMiddleware = require('../middlewares/translate.middleware');

/**
 * Middlewares
 */
translateRoute.post('/create', (req, res, next) => TranslateMiddleware.createAndUpdate(req, res, next));
translateRoute.post('/update/:id', (req, res, next) => TranslateMiddleware.createAndUpdate(req, res, next));

/**
 * Translate endpoint list
 */
translateRoute.get('/list-pronouns/', (req, res) => TranslateController.getListPronouns(req, res));
translateRoute.get('/list-full-lines/', (req, res) => TranslateController.getListFullLines(req, res));
translateRoute.get('/list-words/', (req, res) => TranslateController.getListWords(req, res));
translateRoute.get('/update/:id', accessToken, (req, res) => TranslateController.edit(req, res));
translateRoute.post('/create', accessToken, (req, res) => TranslateController.create(req, res));
translateRoute.post('/update/:id', accessToken, (req, res) => TranslateController.update(req, res));
translateRoute.post('/delete/:id', accessToken, (req, res) => TranslateController.delete(req, res));
translateRoute.post('/translate', (req, res) => TranslateController.translate(req, res));
translateRoute.post('/upload-excel', (req, res) => TranslateController.uploadExcel(req, res));

module.exports = translateRoute;