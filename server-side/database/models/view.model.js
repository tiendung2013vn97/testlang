const { sequelize, Sequelize } = require('..');
/**
* ViewModel describes 'view' table
*/
const ViewModel = sequelize.define(
    'view',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        count: {
            type: Sequelize.INTEGER,
            defaultValue: 1,
        },
        ip_address: Sequelize.STRING,
        video_id: {
            type: Sequelize.INTEGER,
            references: {
                model: "videos",
                key: "id",
            }
        },

        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    },
    {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        timestamps: true,
        tableName: 'view',
    }
);

/**
* Describes relationships
*/
module.exports = ViewModel;