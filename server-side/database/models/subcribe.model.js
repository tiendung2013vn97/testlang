const { sequelize, Sequelize } = require('..');
/**
* SubcribeModel describes 'subscribes' table
*/
const SubcribeModel = sequelize.define(
    'subscribes',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        status: {
            type: Sequelize.STRING,
            defaultValue: 'sub'
        },
        channel_id: Sequelize.INTEGER,
        user_id: Sequelize.INTEGER,
        
        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    },
    {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        timestamps: true,
        tableName: 'subscribes',
    },
);

/**
* Describes relationships
*/

module.exports = SubcribeModel;
