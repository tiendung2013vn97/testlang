const { sequelize, Sequelize } = require('../');

const PaymentMetasModel = sequelize.define(
    'payment_metas',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        payment_id: Sequelize.INTEGER,
        key: Sequelize.STRING,
        value: Sequelize.STRING,

        //Timestamp
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    },
    {   
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        timestamps: true,
        tableName: 'payment_metas',
    },
);

module.exports = PaymentMetasModel;