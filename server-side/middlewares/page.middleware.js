const Middleware = require('./middleware');
const FieldsMiddleware = require('./fields.middleware');
const validator = require('validator');

class NewMiddleware extends Middleware {

    /**
     * Validate Create and Update resource
     */
    static async createAndUpdate(req, res, next){
        // Init
        const { title, content } = req.body;
        const errors = {};

        // // Process
        let required = FieldsMiddleware.checkRequired(
            { title, content }, 
            [ 
                'title',
                'content',
            ],
            [ 
                'Tiêu đề bài viết không được để trống',
                'Nội dung bài viết không được để trống',
            ]
        );
        required = required ? required : {};

        if(Object.keys(required).length) {
            return this.sendRequestError(required, res);
        }

        if (this.isError(errors)) {
            return this.sendRequestError(errors, res);
        }
        next();
    }
}

module.exports = NewMiddleware;