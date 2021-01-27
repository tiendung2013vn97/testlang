const Middleware = require('./middleware');
const FieldsMiddleware = require('./fields.middleware');
const validator = require('validator');

class LangsMiddleware extends Middleware {

    /**
     * Validate Create and Update resource
     */
    static async createAndUpdate(req, res, next){
        // Init
        const { title, code } = req.body;
        const errors = {};

        // Process
        let required = FieldsMiddleware.checkRequired(
            { title, code }, 
            [
                'title',
                'code',
            ], 
            [
                'Tên ngôn ngữ không được để trống',
                'Code ngôn ngữ không được để trống',
            ]
        );
        if (required) {
            return this.sendRequestError(required, res);
        }
        if (this.isError(errors)) {
            return this.sendRequestError(errors, res);
        }
        next();
    }
}

module.exports = LangsMiddleware;