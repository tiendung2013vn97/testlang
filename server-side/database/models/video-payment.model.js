const { sequelize, Sequelize } = require('../');
/**
* VideoPaymentModel describes 'video_payment' table
*/
const VideoPaymentModel = sequelize.define(
    'video_payment',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        video_id: Sequelize.INTEGER,
        user_buy: Sequelize.INTEGER,
        user_sell: Sequelize.INTEGER,
        price: Sequelize.FLOAT,
        amount_buyer: Sequelize.FLOAT,
        amount_seller: Sequelize.FLOAT,
        commission: Sequelize.INTEGER,
        
        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    },
    {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        timestamps: true,
        tableName: 'video_payment',
    },
);

/**
* Describes relationships
*/
module.exports = VideoPaymentModel;
