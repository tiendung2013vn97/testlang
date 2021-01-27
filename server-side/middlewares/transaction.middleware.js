const Middleware = require('./middleware');
const FieldsMiddleware = require('./fields.middleware');
const validator = require('validator');

class TransactionMiddleware extends Middleware {

	/**
     * Middleware deposit money
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    static async recharge(req, res, next) {
        const { amount, code }  = req.body;
        const errors = {};

        // Process
        let required = FieldsMiddleware.checkRequired(
            { amount, code },
            [
                'amount',
                'code',
            ],
            [
                'Số tiền muốn nạp không được để trống',
                'Mã phương thức thanh toán không được để trống',
            ]
        );
        if(required){
            return this.sendRequestError(required, res);
        }
        if (isNaN(amount)){
            errors.amount = this.buildError(errors, 'amount', 'Số tiền muốn nạp phải là kiểu số');
        }
        if (this.isError(errors)) {
            return this.sendRequestError(errors, res);
        }
        next();
    }

    /**
     * Middleware withdrawal money
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    static async withdrawal(req, res, next) {
        const { amount, bankTitle, bankAccountName, bankAccountNumber }  = req.body;
        const errors = {};
        // Process
        let required = FieldsMiddleware.checkRequired(
            { amount, bankTitle, bankAccountName, bankAccountNumber },
            [
                'amount',
                'bankTitle',
                'bankAccountName',
                'bankAccountNumber',
            ],
            [
                'Số tiền muốn rút không được để trống',
                'Tên ngân hàng không được để trống',
                'Tên chủ tài khoản không được để trống',
                'Số tài khoản không được để trống',
            ]
        );
        required = required ? required : {};
        if(Object.keys(required).length){
            return this.sendRequestError(required, res);
        }

        if(!validator.isInt(amount)){
            errors.amount = this.buildError(errors, 'amount', 'Số tiền muốn rút không hợp lệ');
        }
        if(!validator.isInt(bankAccountNumber)){
            errors.bankAccountNumber = this.buildError(errors, 'bankAccountNumber', 'Số tài khoản không hợp lệ');
        }else {
            if(bankAccountNumber.length < 8 || bankAccountNumber.length > 20) {
                errors.bankAccountNumber = this.buildError(errors, 'bankAccountNumber', 'Số tài khoản không hợp lệ');
            }
        }
        if(amount < 10000){
            errors.amount = this.buildError(errors, 'amount', 'Số tiền muốn rút phải từ 10.000 vnđ trở lên');
        }
        if (this.isError(errors)) {
            return this.sendRequestError(errors, res);
        }
        next();
    }
}

module.exports = TransactionMiddleware;