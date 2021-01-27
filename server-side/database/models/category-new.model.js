const { sequelize, Sequelize } = require('..');

/**
* CategoryNewModel describes 'category_news' table
*/
const CategoryNewModel = sequelize.define(
    'category_news',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        status: {
            type: Sequelize.STRING,
            defaultValue: 'active'
        },
        category_id: Sequelize.INTEGER,
        new_id: Sequelize.INTEGER,
        
        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    },
    {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        timestamps: true,
        tableName: 'category_news',
    },
);

/**
* Describes relationships
*/
module.exports = CategoryNewModel;
