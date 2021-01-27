const Middleware = require('./middleware');
const FieldsMiddleware = require('./fields.middleware');
const validator = require('validator');

class CommentMiddleware extends Middleware {
    /**
     * Validate Send and Reply resource
     */
    static async sendAndReplyComment(req, res, next){
        // Init
        const { content } = req.body;
        const errors = {};

        // Process
        let required = FieldsMiddleware.checkRequired({ content }, [
            `content`,
        ], [
            'Nội dung comment không được để trống',
        ]);
        if (required) {
            return this.sendRequestError(required, res);
        }
        if (this.isError(errors)) {
            return this.sendRequestError(errors, res);
        }
        next();
    }
}

module.exports = CommentMiddleware;