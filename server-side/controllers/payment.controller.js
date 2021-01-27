const PaymentModel = require('../database/models/payment.model');
const PaymentMetasModel = require('../database/models/payment-metas.model');
const CommonService = require('../services/common.service');
const CacheService = require('../services/cache.service');
const AuthService = require('../services/auth.service');
const { sequelize, Sequelize } = require('sequelize');
const Op = Sequelize.Op;

class PaymentController {

    /**
     * Get list resources
     * @param {*} req 
     * @param {*} res 
     */
    static async getList(req, res){
        // Init
        const { page } = req.query;
        // Process
        let paymentCache = await CacheService.getCache('payments');
        paymentCache = paymentCache ? paymentCache : {};
        if(!paymentCache[`paymentPage-${page}`]){
            const where = { status: 'active' };
            const order = [ [ 'position', 'ASC'] ];
            const resource = { model: PaymentModel, req, where, order };
            paymentCache[`paymentPage-${page}`] = await CommonService.paginate(resource);
        }
        await CacheService.saveCache(paymentCache, 'payments');
        res.send({ 'message' : 'Lấy danh sách phương thức thanh toán thành công', 'data' : paymentCache[`paymentPage-${page}`] });
    }

    /**
    * Get list payments for client-side
    * @return {void}
    */
    static async getAllPayments(req, res){
        // Process
        const where = { status: 'active' };
        const order = [ [ 'position', 'ASC'] ];
        const include = [ { 
            model: PaymentMetasModel, 
        } ];
        let paymentAll = await PaymentModel.findAll({ where, order, include });
        res.send({ 'message' : 'Lấy danh sách phương thức thanh toán thành công', 'data' : paymentAll }); 
    }

    /**
     * Get form edit payment method by id
     * @param {*} req 
     * @param {*} res 
     */
    static async getEdit(req, res){
        // Init
        const { id } = req.params;

        // Process
        const user = await AuthService.user(req);
        if(!user || user.account_type != 'ADMIN'){
            return res.status(403).send({ 'message' : 'Tài khoản của bạn không có quyền thực hiện chức năng này!' });
        }
        const payment = await PaymentModel.findOne({ 
            where: { id, status: 'active' },
            include: [ PaymentMetasModel ],
        });
        const total = await PaymentModel.count({ where: { status: 'active' } });
        if(payment){
            res.send({ 'message' : 'Lấy dữ liệu thanh toán thành công', 'data' : payment, 'total': total });
        }else{
            res.status(404).send({ 'message' : 'Phương thức thanh toán không tồn tại' });
        }
    }

    /**
    * Update data resource
    * @req {obj}
    * @return {void}
    */
    static async edit(req, res){
        //Init
        const { id } = req.params;
        const { title, position, image_str, content, payment_metas } = req.body;
        // Process
        const user = await AuthService.user(req);
        if(!user || user.account_type != 'ADMIN'){
            return res.status(403).send({ 'message' : 'Tài khoản của bạn không có quyền thực hiện chức năng này!' });
        }
        const payment = await PaymentModel.findOne({ 
            where: { id, status: 'active' },
        });
        if(payment){
            await payment.update({
                title,
                position,
                content,
                image: image_str ? await CommonService.uploadImage(image_str) : payment.image,
            })
            await PaymentMetasModel.destroy({ where: { payment_id: id } });
            for(let i in payment_metas){
                let meta = payment_metas[i];
                if(meta.key && meta.value) {
                    await PaymentMetasModel.create({
                        payment_id: id,
                        key: meta.key,
                        value: meta.value,
                    })
                }
            }
            await CacheService.removeCache('payments');
            res.send({ 'message' : 'Chỉnh sửa phương thức thanh toán thành công' });
        }else{
            res.status(404).send({ 'message' : 'Phương thức thanh toán không tồn tại' });
        }
    }
}

module.exports = PaymentController;
