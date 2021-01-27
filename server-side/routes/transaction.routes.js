const express = require('express');
const transactionRouter = express.Router();
const TransactionController = require('../controllers/transaction.controller');
const TransactionMiddleware = require('../middlewares/transaction.middleware');
const { accessToken } = require('../middlewares/auth.middleware');

/**
 * Middlewares
 */
transactionRouter.post('/recharge', (req, res, next) => TransactionMiddleware.recharge(req, res, next));
transactionRouter.post('/withdrawal', (req, res, next) => TransactionMiddleware.withdrawal(req, res, next));
/**
 * Setting endpoint list.
 */
transactionRouter.get('/list-transfer', (req, res) => TransactionController.getList(req, res));
transactionRouter.get('/history-transaction', accessToken, (req, res) => TransactionController.historyTransaction(req, res));
transactionRouter.get('/detail-transaction/:code', accessToken, (req, res) => TransactionController.detailTransaction(req, res));
transactionRouter.post('/action-transaction/:code', accessToken, (req, res) => TransactionController.actionTransaction(req, res));
transactionRouter.post('/recharge', accessToken, (req, res) => TransactionController.recharge(req, res));
transactionRouter.post('/withdrawal', accessToken, (req, res) => TransactionController.withdrawal(req, res));
transactionRouter.post('/checkout/:transaction_code', accessToken, (req, res) => TransactionController.checkout(req, res));

module.exports = transactionRouter;
