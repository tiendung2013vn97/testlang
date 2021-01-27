const Middleware = require('./middleware');
const FieldsMiddleware = require('./fields.middleware');
const validator = require('validator');

class NewMiddleware extends Middleware {

    /**
     * Validate Create and Update resource
     */
    static async createAndUpdate(req, res, next){
        // Init
        const { title, content, createdBy, categories } = req.body;
        const errors = {};

        // // Process
        let required = FieldsMiddleware.checkRequired(
            { title, content, createdBy }, 
            [ 
                'title',
                'content',
                'createdBy'
            ],
            [ 
                'Tiêu đề bài viết không được để trống',
                'Nội dung bài viết không được để trống',
                'Tên người đăng bài viết không được để trống'
            ]
        );
        required = required ? required : {};
        if(!categories || categories && !categories.length){
            required.categories = [ 'Vui lòng chọn ít nhất một danh mục' ];
        }
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