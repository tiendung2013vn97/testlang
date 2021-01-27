const AuthService = require('../services/auth.service');
const CommonService = require('../services/common.service');
const PayPalService = require('../services/payments/paypal.service');
const NganLuongService = require('../services/payments/nganluong.service');
const CacheService = require('../services/cache.service');
const JWTService = require('../services/jwt.service');
const ActiveTokenModel = require('../database/models/active-token.model');
const SettingModel = require('../database/models/setting.model');
const TransactionModel = require('../database/models/transaction.model');
const UserModel = require('../database/models/user.model');
const VideoModel = require('../database/models/video.model');
const PaymentModel = require('../database/models/payment.model');
const VideoPaymentModel = require('../database/models/video-payment.model');
const LangModel = require('../database/models/lang.model');
const { sequelize, Sequelize } = require('sequelize');
const Op = Sequelize.Op;

class TransactionController {
    /**
     * Get list resource with paginate
     * @param {*} req 
     * @param {*} res 
     */
    static async getList(req, res){
        const { key_words } = req.query;
        const user = await AuthService.user(req);
        if(!user || user.account_type != "ADMIN"){
            return res.status(403).send({ 'message':'Tài khoản của bạn không có quyền thực hiện chức năng này!' });
        }
        let where = {};
        if(key_words){
            where = {
                status: { [Op.not]: 'cancel' },
                type: 'withdrawal',
                [Op.or]: [
                    { transaction_code: {[Op.like]: '%' +  key_words + '%'}},
                ]
            };
        }else{
            where = {
                status: { [Op.not]: 'cancel' },
                type: 'withdrawal',
            };
        }
        const include = [
            {
                model: UserModel,
                where: { status: 'active' },
                attributes: ['username', 'avatar'],
                required: false,
            },
        ];
        const order = [
            ['createdAt', 'DESC']
        ];
        const resource = { model: TransactionModel, req, where, order, include };
        const transfers = await CommonService.paginate(resource);
        res.send({ 'message': 'Lấy danh sách chuyển khoản thành công', 'data': transfers });
    }

    /**
     * Get list history transaction resource with paginate
     * @param {*} req 
     * @param {*} res 
     */
    static async historyTransaction(req, res){
        const { type, fromDate, toDate } = req.query;
        const user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message': 'Thông tin đăng nhập không chính xác' })
        }
        if((fromDate != '' || toDate != '') && fromDate >= toDate){
            return res.status(400).send({ 'message' : 'Ngày tìm kiếm không hợp lệ!' });
        }
        let where = {
            user_id: user.id,
            status: 'success',
        };
        let attributes = ['transaction_code', 'amount', 'status', 'amountAfterTransaction', 'amountAfterFee', 'createdAt', 'updatedAt'];
        let include = [
            {
                model: PaymentModel,
                where: { status: 'active' },
                attributes: ['title'],
                required: false,
            },
        ]
        let order = [
            ['createdAt', 'DESC']
        ];
        let historyTransaction = '';
        if(!type || type == 'recharge'){
            where.type = 'recharge';
            if(fromDate && toDate && fromDate < toDate){
                where.createdAt = { [Op.between]: [fromDate, toDate] };
            }
            let resource = { model: TransactionModel, req, where, order, include, attributes };
            historyTransaction = await CommonService.paginate(resource);
        }else if(type == 'withdrawal'){
            where = {
                user_id: user.id,
                type: 'withdrawal',
            }
            if(fromDate && toDate && fromDate < toDate){
                where.createdAt = { [Op.between]: [fromDate, toDate] };
            }
            let resource = { model: TransactionModel, req, where, order, include, attributes };
            historyTransaction = await CommonService.paginate(resource);
        }else if(type == 'payment-video'){
            where = {
                status: 'active',
            }
            if(fromDate && toDate && fromDate < toDate){
                where.createdAt = { [Op.between]: [fromDate, toDate] };
            }
            include = [
                {
                    model: UserModel,
                    as: 'payments_users',
                    where: {
                        id: user.id,
                        status: 'active' 
                    },
                    attributes: ['username'],
                    required: true,
                },
                {
                    model: LangModel,
                    as: 'raw_lang',
                    required: true,
                },
                {
                    model: LangModel,
                    as: 'translate_lang',
                    required: true,
                }
            ];
            attributes  = ['title', 'slug', 'price'];
            let resource = { model: VideoModel, req, where, include, attributes };
            historyTransaction = await CommonService.paginate(resource);
        }else if(type == 'receive-money'){
            where = {
                user_sell: user.id,
            }
            if(fromDate && toDate && fromDate < toDate){
                where.createdAt = { [Op.between]: [fromDate, toDate] };
            }
            include = [
                {
                    model: VideoModel,
                    include: [
                        {
                            model: LangModel,
                            as: 'raw_lang',
                        },
                        {
                            model: LangModel,
                            as: 'translate_lang',
                        }
                    ],
                }
            ];
            let resource = { model: VideoPaymentModel, req, where, include };
            historyTransaction = await CommonService.paginate(resource);
        }
        res.send({ 'message': 'Lấy danh sách lịch sử giao dịch thành công', 'data': historyTransaction });
    }

    /**
    * Recharge Money
    * @return {void}
    */
    static async recharge(req, res){
        const { code, amount } = req.body;
        const user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message': 'Thông tin đăng nhập không chính xác' })
        }
        let payment = await PaymentModel.findOne({ where: { code } });
        if(payment) {
            // Create transaction history
            const transaction = await TransactionModel.create({
                user_id: user.id,
                payment_id: payment.id,
                amount,
                status: 'pending',
                type: 'recharge',
                transaction_code: `MGD-${Math.round(new Date().getTime()/1000)}`,
            });

            // Use code to define payment method and process
            let request = {
                req, 
                user, 
                transaction,
            }
            if(code == 'paypal'){
                PayPalService.createPaypalPayment(request, res);
            }else if(code == 'nganluong'){
                NganLuongService.createNganLuongPayment(request, res);
            }
        }else {
            res.status(404).send({ 'message' : 'Phương thức thanh toán này không tồn tại!' });
        }
    }

    /**
     * Checkout after payment
     * @param {*} req
     * @param {*} res 
     */
    static async checkout(req, res){
        // paymentId
        const { transaction_code } = req.params;
        const { status } = req.query;
        let transaction = await TransactionModel.findOne({ 
            where: { transaction_code }, 
            include: [ PaymentModel ]
        });
        if(transaction){
            const user = await AuthService.user(req);
            if (!user || user.id != transaction.user_id) {
                return res.status(403).send({ 'message': 'Tài khoản của bạn không có quyền thực hiện chức năng này!' })
            }
            if(transaction.type == 'recharge' && transaction.status == 'pending'){
                let payment = transaction.payment;
                let request = {
                    transaction,
                    req,
                    user,
                };
                if(status == 'fail'){
                    await transaction.update({
                        status: 'cancel',
                    });
                    res.send({ 'message': 'Bạn đã hủy đơn hàng!', 'transaction_code': transaction_code });
                }else{
                    if(payment.code == 'paypal'){
                        PayPalService.executePayPalPayment(request, res);
                    }else if(payment.code == 'nganluong'){
                        NganLuongService.executeNganLuongPayment(request, res);
                    }
                }
            } else {
                res.send({ 'message': '', 'transaction_code': transaction_code });
            }
        }else {
            res.status(404).send({ 'message': 'Không tìm thấy đơn hàng' });
        }
    }

    /**
    * Withdrawal Money
    * @return {void}
    */
    static async withdrawal(req, res){
        const { amount, bankTitle, bankAccountName, bankAccountNumber, notes } = req.body;
        const user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message': 'Thông tin đăng nhập không chính xác' })
        }
        if(amount > user.balance){
            return res.status(403).send({ 'message' : 'Số tiền rút vượt quá số dư trong tài khoản của bạn!' });
        }else{
            const userTransaction = await TransactionModel.findOne({
                where: {
                    user_id: user.id,
                    status: 'pending',
                    type: 'withdrawal',
                },
            });
            if(userTransaction){
                return res.status(403).send({ 'message' : 'Không thể tạo yêu cầu rút tiền. Vui lòng chờ admin duyệt yêu cầu rút tiền cũ hoặc bạn có thể hủy yêu cầu rút tiền cũ và tạo lại yêu cầu mới.' });
            }
            const getConfig = await SettingModel.findOne({ 
                where: { 
                    key: 'more_withdrawal_fee',
                } 
            });
            let more_withdrawal_fee = getConfig.value ? getConfig.value : 5000;
            if((amount - more_withdrawal_fee) < 1000) {
                return res.status(403).send({ 'message' : 'Số tiền muốn rút phải nhiều hơn phí mỗi lần rút tiền tối thiểu là 1.000 vnđ' });
            }else{
                let amountAfterFee = amount - more_withdrawal_fee;
                let amountAfterTransaction = user.balance - amount;
                await TransactionModel.create({
                    amount,
                    status: 'pending',
                    user_id: user.id,
                    type: 'withdrawal',
                    bankTitle,
                    bankAccountName,
                    bankAccountNumber,
                    amountAfterTransaction,
                    amountAfterFee,
                    notes,
                    transaction_code: `MGD-${Math.round(new Date().getTime()/1000)}`,
                });
                return res.send({ 'message' : 'Tạo yêu cầu rút tiền thành công. Vui lòng chờ admin duyệt!' });
            }
        }
    }

    /**
    * Detail transaction withdrawal in client page
    */
    static async detailTransaction(req, res){
        const user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message': 'Thông tin đăng nhập không chính xác' })
        }
        const { code } = req.params;
        const detailTransaction = await TransactionModel.findOne({
            where: {
                transaction_code: code,
                user_id: user.id,
                type: 'withdrawal',
            },
            include: [
                {
                    model: UserModel,
                    attributes: ['username', 'email', 'phone'],
                    required: false,
                },
            ]
        });
        if(detailTransaction){
            return res.send({ 'message' : 'Lấy thành công chi tiết giao dịch', detailTransaction });
        }else{
            return res.status(404).send({ 'message' : 'Không tìm thấy giao dịch!' });
        }
    }

    /**
    * Action transaction withdrawal Admin Page
    */
    static async actionTransaction(req, res){
        const user = await AuthService.user(req);
        if (!user) {
            return res.status(403).send({ 'message': 'Thông tin đăng nhập không chính xác' })
        }
        const { code } = req.params;
        const { action } = req.query;
        let where = {
            transaction_code: code,
            type: 'withdrawal',
        }
        if(user && user.account_type != "ADMIN"){
            if(action == "view"){
                where.user_id = user.id;
            }else if(action == "cancel"){
                where.user_id = user.id;
                where.status = "pending";
            }else{
                return res.status(403).send({ 'message':'Tài khoản của bạn không có quyền thực hiện chức năng này!' });
            }
        }
        const detailTransaction = await TransactionModel.findOne({
            where,
            include: [
                {
                    model: UserModel,
                    attributes: ['id', 'username', 'email', 'phone', 'status'],
                    required: false,
                },
            ]
        });
        if(detailTransaction){
            let token = '';
            if(user && user.account_type == "ADMIN"){
                if(action == "transfer"){
                    if(detailTransaction.status != "cancel" && detailTransaction.status != "success"){
                        let userTran = await UserModel.findOne({
                            where: {
                                id: detailTransaction.user_id,
                            }
                        });
                        await userTran.update({
                            balance: detailTransaction.amountAfterTransaction,
                        });
                        token = await JWTService.generateTokenByUser(userTran);
                        const activeToken = await ActiveTokenModel.findOne({ where: { user_id: userTran.id } });
                        activeToken.update({ token });
                        await detailTransaction.update({
                            status: 'success', 
                        });
                    }else{
                        return res.status(403).send({ 'message':'Giao dịch này đã được xử lí trước đó. Bạn không thể tiếp tục chuyển khoản!' });
                    }
                }else if(action == "cancel"){
                    if(detailTransaction.status != "success"){
                        detailTransaction.update({
                            status: 'cancel', 
                        });
                    }else{
                        return res.status(403).send({ 'message':'Giao dịch này đã được xử lí trước đó, bạn không thể hủy giao dịch!' });
                    }
                }
            }else{
                if(action == "cancel"){
                    if(detailTransaction.status == "pending"){
                        detailTransaction.update({
                            status: 'cancel', 
                        });
                    }else{
                        return res.status(403).send({ 'message':'Giao dịch này đã được xử lí trước đó, bạn không thể hủy giao dịch!' });
                    }
                }
            }
            let message = "";
            if(action == "view"){
                message = "Lấy thành công chi tiết giao dịch";
            }else if(action == "transfer"){
                message = "Xác nhận chuyển khoản giao dịch thành công";
            }else if(action == "cancel"){
                message = "Hủy bỏ giao dịch thành công";
            }else{
                message = "Yêu cầu giao dịch không hợp lệ";
            }
            return res.send({ 'message' : message, detailTransaction, token });
        }else{
            return res.status(404).send({ 'message' : 'Không tìm thấy giao dịch!' });
        }
    }
}

module.exports = TransactionController;
