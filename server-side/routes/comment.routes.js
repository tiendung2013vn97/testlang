const express = require('express');
const commentRouter = express.Router();
const CommentController = require('../controllers/comment.controller'); 
const CommentMiddleware = require('../middlewares/comment.middleware');
const { accessToken } = require('../middlewares/auth.middleware');

/**
 * Middlewares
 */
commentRouter.post('/sendcomment/', (req, res, next) => CommentMiddleware.sendAndReplyComment(req, res, next));
commentRouter.post('/sendreply/', (req, res, next) => CommentMiddleware.sendAndReplyComment(req, res, next));

/**
 * Video endpoint list
 */
commentRouter.post('/sendcomment/', accessToken, (req, res) => CommentController.sendComment(req, res));
commentRouter.post('/sendreply/', accessToken, (req, res) => CommentController.sendComment(req, res));
commentRouter.get('/get-comments/:idVideo', (req, res) => CommentController.getCommentsByIdVideo(req, res));
commentRouter.get('/replies/:parentId', (req, res) => CommentController.getListReplies(req, res));
module.exports = commentRouter;