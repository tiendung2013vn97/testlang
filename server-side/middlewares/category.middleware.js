const passport = require('passport');
const Middleware = require('./middleware');
const FieldsMiddleware = require('./fields.middleware');
const validator = require('validator');

/**
 * This middleware of Category
 */

class CategoryMiddleware extends Middleware {

    /**
     * validate Category create and update
     */
    static async createAndEdit(req, res, next) {
        // Init
        const { title } = req.body;
        const errors = {};

        // Process
        let required = FieldsMiddleware.checkRequired({ title }, [
            `title`,
        ], [
            'Tên không được để trống',
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

module.exports = CategoryMiddleware;