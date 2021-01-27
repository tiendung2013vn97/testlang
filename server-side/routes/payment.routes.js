const express = require('express');
const paymentRouter = express.Router();
const PaymentController = require('../controllers/payment.controller');
const PaymentMiddleware = require('../middlewares/payment.middleware');
const { accessToken } = require('../middlewares/auth.middleware');

/**
 * Middleware payment.
 */
paymentRouter.post('/edit/:id', (req, res, next) => PaymentMiddleware.edit(req, res, next));

/**
 * Payment endpoint list.
 */
paymentRouter.get('/', (req, res) => PaymentController.getList(req, res));
paymentRouter.get('/all', (req, res) => PaymentController.getAllPayments(req, res));
paymentRouter.get('/edit/:id', accessToken, (req, res) => PaymentController.getEdit(req, res));
paymentRouter.post('/edit/:id', accessToken, (req, res) => PaymentController.edit(req, res));

module.exports = paymentRouter;
