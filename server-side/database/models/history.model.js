const { sequelize, Sequelize } = require('../');
/**
* HistoryModel describes 'history' table
*/
const HistoryModel = sequelize.define(
    'history',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        status: {
            type: Sequelize.STRING,
            defaultValue: 'active',
        },
        count: {
            type: Sequelize.INTEGER,
            defaultValue: 1,
        },
        user_id: Sequelize.INTEGER,
        video_id: Sequelize.INTEGER,

        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    },
    {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        timestamps: true,
        tableName: 'history',
    }
);

/**
* Describes relationships
*/
module.exports = HistoryModel;