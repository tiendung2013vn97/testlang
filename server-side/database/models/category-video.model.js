const { sequelize, Sequelize } = require('../');

/**
* CategoryVideoModel describes 'category_videos' table
*/
const CategoryVideoModel = sequelize.define(
    'category_videos',
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
        video_id: Sequelize.INTEGER,
        
        // Timestamps
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    },
    {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        timestamps: true,
        tableName: 'category_videos',
    },
);

/**
* Describes relationships
*/
module.exports = CategoryVideoModel;
