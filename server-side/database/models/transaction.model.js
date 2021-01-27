const { sequelize, Sequelize } = require('../');

/**
* TransactionModel describes 'transactions' table
*/
const TransactionModel = sequelize.define(
    'transactions',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        payment_id: Sequelize.INTEGER,
        user_id: Sequelize.INTEGER,
        transaction_code: Sequelize.STRING,
        amount: Sequelize.FLOAT,
        status: Sequelize.STRING,
        type: Sequelize.STRING,
        amountAfterTransaction: Sequelize.FLOAT,
        bankTitle: Sequelize.STRING,
        bankAccountName: Sequelize.STRING,
        bankAccountNumber: Sequelize.FLOAT,
        amountAfterFee: Sequelize.FLOAT,
        notes: Sequelize.STRING,
    },
    {   
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        timestamps: true,
        tableName: 'transactions',
    },
);

module.exports = TransactionModel;