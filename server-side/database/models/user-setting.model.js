const { sequelize, Sequelize } = require('..');

/**
* SettingModel describes 'payments' table
*/
const SettingModel = sequelize.define(
    'user_settings',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: Sequelize.INTEGER,
            require:true,
            references: {
                model: "users",
                key: "id"
            }
        },
        value: {
            type:Sequelize.JSON,
            require:true
        },
        //Timestamp
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    },
    {   
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        timestamps: true,
        tableName: 'user_settings',
    },
);

module.exports = SettingModel;
