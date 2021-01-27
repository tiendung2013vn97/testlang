const { sequelize, Sequelize } = require('../');
const PaymentMetasModel = require('../models/payment-metas.model');
const TransactionModel = require('../models/transaction.model');

const PaymentModel = sequelize.define(
    'payments',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        code: Sequelize.STRING,
        status: {
            type: Sequelize.STRING,
            defaultValue: 'active'
        },
        position: Sequelize.INTEGER,
        title: Sequelize.STRING,
        image: Sequelize.STRING,
        content: Sequelize.TEXT,
        //Timestamp
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    },
    {   
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        timestamps: true,
        tableName: 'payments',
    },
);

/**
* Describes relationships
*/
PaymentModel.hasMany(PaymentMetasModel, { foreignKey: 'payment_id' });
PaymentMetasModel.belongsTo(PaymentModel, { foreignKey: 'payment_id' });

PaymentModel.hasMany(TransactionModel, { foreignKey: 'payment_id' });
TransactionModel.belongsTo(PaymentModel, { foreignKey: 'payment_id' });
module.exports = PaymentModel;
