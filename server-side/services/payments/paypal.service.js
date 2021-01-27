const JWTService = require('../jwt.service');
const PaymentMetaModel = require('../../database/models/payment-metas.model');
const ActiveTokenModel = require('../../database/models/active-token.model');
const TransactionModel = require('../../database/models/transaction.model');
const PayPal = require('paypal-rest-sdk');

class PayPalService {

    /**
    * Get Merchant Data Setting
    * @param {*} id 
    * @param {*} key
    */
    static async initMerchantData(id, key) {
        let paymentMetaDt = await PaymentMetaModel.findOne({ where: { payment_id: id, key } })
        return paymentMetaDt.value;
    }

    /**
    * Config PayPal
    * @param {*} id 
    */
    static async initPayPalConfig(id) {
        let config = {
            'mode': await this.initMerchantData(id, 'mode'), //sandbox or live
            'client_id': await this.initMerchantData(id, 'client_id'),
            'client_secret': await this.initMerchantData(id, 'client_secret'),
        };
        return config;
    }

    /**
    * Create PayPal payment
    * @param {*} request 
    */
    static async createPaypalPayment(request, res) {
        // Init
        const { req, user, transaction } = request;
        const { amount, url } = req.body;
        const config = await this.initPayPalConfig(transaction.payment_id);

        // Process
        let usd_rate = await this.initMerchantData(transaction.payment_id, 'usd_rate');
        usd_rate = usd_rate ? usd_rate : 23000;
        let price = parseFloat(amount / usd_rate).toFixed(2);

        PayPal.configure(config);
        let body = {
            "intent": "sale", // sale or order
            "payer": {
                "payment_method": "PayPal"
            },
            "redirect_urls": {
                "return_url": `${url}/profile/recharge/checkout/${transaction.transaction_code}?type=PayPal`,
                "cancel_url": `${url}/profile/recharge/checkout/${transaction.transaction_code}?status=fail`
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": `Nạp ${amount} VND cho đơn "${transaction.transaction_code}"`,
                        "sku": `${transaction.transaction_code}`,
                        "price": parseFloat(price),
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": parseFloat(price),
                },
                "description": `Nạp ${amount} VND cho đơn "${transaction.transaction_code}".`,
            }]
        };
        PayPal.payment.create(body, (error, payment) => {
            var links = {};
            if(error){
                res.status(403).send({ 'message' : 'Gửi yêu cầu thất bại!' });
            } else {
                // Capture HATEOAS links
                payment.links.forEach(function(linkObj){
                    links[linkObj.rel] = {
                        href: linkObj.href,
                        method: linkObj.method
                    };
                })
                // If the redirect URL is present, redirect the customer to that URL
                if (links.hasOwnProperty('approval_url')){
                    // Redirect the customer to links['approval_url'].href
                    let redirect = links['approval_url'].href;
                    res.send({ 'message' : 'Đang điều hướng! Vui lòng chờ', 'redirect_url' : redirect });
                }
                else {
                    res.status(403).send({ 'message' : 'Gửi yêu cầu thất bại!' });
                }
            }
        });
    }

    /**
     * Execute PayPal Payment 
     * @param {*} request 
     * @param {*} res 
     */
    static async executePayPalPayment(request, res) {
        // Init
        const { req, transaction, user } = request;
        const { paymentId, token, PayerID } = req.body;
        const transaction_code = transaction.transaction_code;
        const config = await this.initPayPalConfig(transaction.payment_id);

        // Process
        let usd_rate = await this.initMerchantData(transaction.payment_id, 'usd_rate');
        usd_rate = usd_rate ? usd_rate : 23000;
        let price = parseFloat(transaction.amount / usd_rate).toFixed(2);

        PayPal.configure(config);
        let body = {
            "payer_id": PayerID,
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": parseFloat(price)
                }
            }]
        };
        
        PayPal.payment.execute(paymentId, body, async (error, payment) => {
            if (error) {
                await transaction.update({
                    status: 'cancel',
                })
                res.status(403).send({ 'message': 'Có lỗi trong quá trình xử lý. Nạp tiền thất bại!', 'transaction_code': transaction_code });
            }else {
                if (payment.state == 'approved'){
                    // Add balance here
                    await user.update({
                        'balance': user.balance + parseFloat(transaction.amount)
                    });
                    let token = await JWTService.generateTokenByUser(user);
                    const activeToken = await ActiveTokenModel.findOne({ where: { user_id: user.id } });
                    activeToken.update({ token })
                    await transaction.update({
                        status: 'success',
                        amountAfterTransaction: user.balance,
                    });
                    res.send({ 'message': 'Nạp tiền thành công! Tiền được cộng vào số dư tài khoản của bạn.', 'transaction_code': transaction_code, token });
                }else {
                    // Cancel if fail
                    await transaction.update({
                        status: 'cancel',
                    })
                    res.status(403).send({ 'message': 'Có lỗi trong quá trình xử lý. Nạp tiền thất bại!', 'transaction_code': transaction_code });
                }
              }
        });
    }
}

module.exports = PayPalService;
