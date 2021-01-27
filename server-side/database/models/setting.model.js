const { sequelize, Sequelize } = require('../');

/**
* SettingModel describes 'payments' table
*/
const SettingModel = sequelize.define(
    'settings',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        key: Sequelize.STRING,
        value: Sequelize.TEXT,
        //Timestamp
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    },
    {   
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        timestamps: true,
        tableName: 'settings',
    },
);

module.exports = SettingModel;
