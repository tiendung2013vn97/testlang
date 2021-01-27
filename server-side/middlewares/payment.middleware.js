const Middleware = require('./middleware');
const FieldsMiddleware = require('./fields.middleware');
const validator = require('validator');

class PaymentMiddleware extends Middleware {
    /**
    * Validate edit payment request
    */
    static async edit(req, res, next) {
    	const { title } = req.body;
        const errors = {};
        const required = FieldsMiddleware.checkRequired(
            { title }, 
            [ 
                'title',
            ],
            [ 
                'Tên không được để trống', 
            ]
        );

        if (required) {
            return this.sendRequestError(required, res);
        }
        next();
    }
}

module.exports = PaymentMiddleware;
