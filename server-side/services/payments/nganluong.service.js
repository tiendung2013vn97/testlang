const JWTService = require('../jwt.service');
const PaymentMetaModel = require('../../database/models/payment-metas.model');
const ActiveTokenModel = require('../../database/models/active-token.model');
const axios = require('axios');
const md5 = require('md5');
class NganLuongService {
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
    * Config NganLuong
    * @param {*} id 
    */
    static async initNganLuongConfig(id) {
        let config = {
            'mode': await this.initMerchantData(id, 'mode'), //sandbox or live
            'merchant_id': await this.initMerchantData(id, 'merchant_id'),
            'merchant_pass': await this.initMerchantData(id, 'merchant_pass'),
            'lang': await this.initMerchantData(id, 'lang'),
            'receiver': await this.initMerchantData(id, 'receiver'),
        };
        return config;
    }

    /**
    * Create NganLuong payment
    * @param {*} request 
    */
    static async createNganLuongPayment(request, res) {
        // Init
        const { req, user, transaction } = request;
        user.email = user.email ? user.email : '';
        user.phone = user.phone ? user.phone : '';
        const { amount, url } = req.body;
        const data = await this.initNganLuongConfig(transaction.payment_id);

        // Process
        const order_description = `Nạp tiền vào số dư cho Website langadvisor.com.`;
        let secure_code = md5(data.merchant_id + ' ' + `${url}/profile/recharge/checkout/${transaction.transaction_code}?type=NganLuong ` + data.receiver + ' test ' + transaction.transaction_code + ' ' + amount + ' vnd 1 0 0 0 0 '+ order_description + ' ' + user.username + '*|*' + user.email + '*|*' + user.phone + '  ' + data.merchant_pass);
        let url_api = '';
        if(data.mode == 'sandbox'){
            url_api = 'https://sandbox.nganluong.vn:8088/nl35/checkout.php';
        }else{
            url_api = 'https://www.nganluong.vn/checkout.php';
        }
        const response = await axios({
            url: encodeURI(url_api + '?merchant_site_code=' + data.merchant_id + '&return_url='+ url + '/profile/recharge/checkout/' + transaction.transaction_code + '?type=NganLuong' + '&receiver=' + data.receiver + '&transaction_info=test' + '&order_code=' + transaction.transaction_code + '&price=' + amount + '&currency=vnd&quantity=1&tax=0&discount=0&fee_cal=0&fee_shipping=0&order_description='+ order_description +'&buyer_info=' + user.username + '*|*' + user.email + '*|*' + user.phone + '&affiliate_code=&lang=' + data.lang + '&secure_code=' + secure_code + '&cancel_url='+ url + '/profile/recharge/checkout/' + transaction.transaction_code + '?status=fail'),
            method: 'get'
        })
        res.send({ 'message' : 'Đang điều hướng! Vui lòng chờ', 'redirect_url' : response.config.url });
    }

    /**
    * Get result by webservice
    * @param {*} request 
    */
    static async UpdateOrder(order_code, payment_id, payment_type, secure_code, transaction_info) {
        let secure_pass = '';
        let verify_secure_code = md5(transaction_info + ' ' + order_code + ' ' + payment_id + ' ' + payment_type + ' ' + secure_pass);
        if(verify_secure_code == secure_code){
            return 1; // bill paid
        }else{
            return 0; // Unpaid bill
        }
    }

    /**
    * check and get result bill v2
    * @param {*} request 
    */
    static async executeNganLuongPayment(request, res) {
        const { req, user, transaction } = request;
        const data = await this.initNganLuongConfig(transaction.payment_id);
        let url_api = '';
        if(data.mode == 'sandbox'){
            url_api = 'https://sandbox.nganluong.vn:8088/nl35/service/order/checkV2';
        }else{
            url_api = 'https://www.nganluong.vn/service/order/checkV2';
        }
        let checksum = md5(transaction.transaction_code + '|' + data.merchant_pass);
        const response = await axios({
            url: encodeURI(url_api + '?merchant_id=' + data.merchant_id + '&order_code=' + transaction.transaction_code + '&checksum=' + checksum),
            method: 'post'
        });
        let resultNotice = '';
        if(response.data.error_code == '00'){
            resultNotice = 'Đơn hàng ' + transaction.transaction_code + ' đã thanh toán thành công';
        }else if(response.data.error_code == '06'){
            resultNotice = 'Mã merchant không tồn tại hoặc chưa được kích hoạt';
        }else if(response.data.error_code == '03'){
            resultNotice = 'Sai tham số gửi tới NganLuong.vn (có tham số sai tên hoặc kiểu dữ liệu), sai checksum';
        }else if(response.data.error_code == '01'){
            resultNotice = 'Sai phương thức, không đúng phương thức POST';
        }else if(response.data.error_code == '29'){
            resultNotice = 'Token không tồn tại';
        }else if(response.data.error_code == '81'){
            resultNotice = 'Đơn hàng chưa được thanh toán';
        }else if(response.data.error_code == '99'){
            resultNotice = 'Lỗi không xác định';
        }else if(response.data.error_code == '13'){
            resultNotice = 'Đơn hàng không đúng của merchant';
        }else{
            resultNotice = 'Lỗi không xác định';
        }
        if(response.data.error_code == '00'){
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
            res.send({ 'message': 'Nạp tiền thành công! Tiền được cộng vào số dư tài khoản của bạn.', 'transaction_code': transaction.transaction_code, token });
        }else{
            await transaction.update({
                status: 'cancel',
            });
            res.status(403).send({ 'message': 'Có lỗi trong quá trình xử lý. Nạp tiền thất bại! ' + resultNotice, 'transaction_code': transaction_code });
        }
    }
}
module.exports = NganLuongService;